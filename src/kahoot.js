const EventEmitter = require("events");
const token = require("./util/token.js");
const ws = require("ws");
const sleep = require("./util/sleep.js");
const ua = require("random-useragent");
const ChallengeHandler = require("./util/ChallengeHandler.js");

// A Kahoot! client.
class Client extends EventEmitter{

  /**
   * constructor - Create a Kahoot! client.
   *
   * @param  {Object} options Sets up the client. Options can control what events and methods are available to the client. By default, all options are enabled, besides proxies.
   *
   */
  constructor(options={}){
    super();
    // assign options
    this.defaults = {};
    for(let i in this._defaults){
      if(typeof this._defaults[i] === "function"){
        this.defaults[i] = this._defaults[i].bind({});
        continue;
      }
      this.defaults[i] = {};
      Object.assign(this.defaults[i],this._defaults[i]);
    }
    Object.assign(this.defaults.options,options.options);
    Object.assign(this.defaults.modules,options.modules);
    this.defaults.proxy = options.proxy || this.defaults.proxy;
    this.defaults.wsproxy = options.wsproxy || this.defaults.wsproxy;

    this.classes = {};
    this.handlers = {};
    this.waiting = {};
    this.data = {};

    // apply modules
    for(let mod in this.defaults.modules){
      if(this.defaults.modules[mod] || this.defaults.modules[mod] === undefined){
        try{require("./modules/" + mod + ".js").call(this);}catch(err){}
      }
    }

    // apply main modules
    require("./modules/main.js").call(this);

    this.userAgent = ua.getRandom();
    this.messageId = 0;
  }

  /**
   * @static defaults - Creates a new Client constructor
   *
   * @returns {class}  Returns a new Client constructor which uses new defaults
   */
  static defaults(options){
    var self = this;
    function Clone(){
      return new self(options);
    }
    Clone.defaults = this.defaults.bind(Clone);
    Clone.join = this.join.bind(Clone);
    return Clone;
  }

  /**
   * @static join - Creates a {@link Client} and joins the game
   *
   * @see Client#join
   * @returns {Object}      Returns the {@link Client} instead of a Promise.
   * @property {Client} client The newly created client joining the game
   * @property {Promise<LiveEventTimetrack>} event See {@link Client#join}
   */
  static join(){
    const client = new this;
    const event = client.join.apply(client,arguments);
    return {
      client,
      event
    };
  }

  /**
   * Answer the Two Factor Authentification
   *
   * @param  {Number[]} [steps=[0,1,2,3]] A list of four numbers (0,1,2,3). Each number represents one of the four colors in the two-factor code (red,blue,yellow,green) respectively
   * @returns {Promise<LiveEventTimetrack>} Resolves when the message is sent and received. Rejects if the message fails to send.
   */
  async answerTwoFactorAuth(steps){
    if(this.gameid[0] == "0"){
      throw "Cannot answer two steps in Challenges";
    }
    steps = steps || [0,1,2,3];
    const wait = Date.now() - this.twoFactorResetTime;
    if(wait < 250){
      await sleep((250 - wait) / 1000);
    }
    return new Promise((resolve,reject)=>{
      this._send(new this.classes.LiveTwoStepAnswer(this,steps),(r)=>{
        if(r === null || !r.successful){
          reject(r);
        }else{
          resolve(r);
        }
      });
    });
  }

  /**
   * Join a game. Also joins with team members.
   *
   * @param  {String} name The name of the player
   * @param  {(String[]|Boolean)} [team=["Player 1","Player 2","Player 3","Player 4"]] The team member names.
   * if false, the team members will not be added automatically.
   * @returns {Promise<Object>}      Resolves when join + team (if applicable) succeeds
   * The resolved object should contain information about twoFactor, namerator, and gameMode
   * If joining fails, this will reject with the error
   */
  async join(pin,name,team){
    this.gameid = pin + "";
    this.name = name;
    const settings = await this._createHandshake();
    this.settings = settings;
    // now join
    await sleep(1);
    await this._send(new this.classes.LiveJoinPacket(this,name));
    return new Promise((resolve,reject)=>{
      this.handlers.JoinFinish = async (message)=>{
        if(message.channel === "/service/status"){
          this.emit("status",message.data);
          if(message.data.status === "LOCKED"){
            message.data.description = "Locked";
            reject(message.data);
            delete this.handlers.JoinFinish;
            this.disconnectReason = "Quiz Locked";
            this.leave(true);
            return;
          }
        }
        if(message.channel === "/service/controller" && message.data && message.data.type === "loginResponse"){
          if(message.data.error){
            reject(message.data);
            if(message.data.description.toLowerCase() !== "duplicate name"){
              this.disconnectReason = message.description;
              this.leave(true);
            }
          }else{
            this.cid = message.data.cid;
            if(settings.gameMode === "team"){
              await sleep(1);
              if(team !== false){
                team = team || ["Player 1","Player 2","Player 3","Player 4"];
                // send team!
                try{
                  await this.joinTeam(team,true);
                }catch(e){
                  // This should not happen.
                  // Needs testing: Does the client need to re-send team members?
                  console.log("ERR! Failed to send team members. Retrying");
                  try{
                    await this.joinTeam(team,true);
                  }catch(e){
                    console.log("ERR! Failed to send team members a second time. Assuming the best.");
                  }
                }
                this.emit("Joined",settings);
                if(!this.settings.twoFactorAuth){
                  this.connected = true;
                }else{
                  this.emit("TwoFactorReset");
                }
                resolve(settings);
              }else{
                this.emit("Joined",settings);
                if(this.settings.twoFactorAuth){
                  this.emit("TwoFactorReset");
                }
                resolve(settings);
              }
            }else{

              /**
               * Emitted when the client joins the game
               *
               * @event Client#Joined
               * @type {Object}
               * @property {String<Function>} challenge The challenge function. (Pointless)
               * @property {Boolean} namerator Whether the game has the friendly name generator on.
               * @property {Boolean} participantId
               * @property {Boolean} smartPractice
               * @property {Boolean} twoFactorAuth Whether the game has twoFactorAuth enabled
               * @property {String|undefined} gameMode If the gameMode is 'team,' then it is team mode, else it is the normal classic mode.
               */
              this.emit("Joined",settings);
              if(!this.settings.twoFactorAuth){

                /**
                 * Whether the client is ready to receive events
                 * This means that the client has joined the game
                 *
                 * @type {Boolean}
                 */
                this.connected = true;
              }else{
                this.emit("TwoFactorReset");
              }
              resolve(settings);
            }
          }
          delete this.handlers.JoinFinish;
        }
      };
    });
  }

  /**
   * Send team members
   *
   * @param  {String[]} [team=["Player 1","Player 2","Player 3","Player 4"]] A list of team members names
   * @returns {Promise<LiveEventTimetrack>} Resolves when the team members are sent. Rejects if for some reason the message was not received by Kahoot!'s server.
   */
  async joinTeam(team,s){
    if(this.gameid[0] === "0" || this.settings.gameMode !== "team" || !this.socket || this.socket.readyState !== 1){
      throw "Failed to send the team.";
    }
    team = team || ["Player 1","Player 2","Player 3","Player 4"];
    if(this.settings.gameMode !== "team"){
      throw "The gameMode is not 'team'.";
    }
    return new Promise((resolve,reject)=>{
      this._send(new this.classes.LiveJoinTeamPacket(this,team),(r)=>{
        if(r === null || !r.successful){
          reject(r);
        }else{
          !s && this.emit("Joined",this.settings);
          if(!this.settings.twoFactorAuth){
            this.connected = true;
          }else{
            !s && this.emit("TwoFactorReset");
          }
          resolve(r);
        }
      });
    });
  }

  /**
   * leave - Leave the game.
   */
  leave(){
    this._send(new this.classes.LiveLeavePacket(this));
    if(!arguments[0]){this.disconnectReason = "Client Left";}
    setTimeout(()=>{
      if(!this.socket){return;}
      this.socket.close();
    },500);
  }

  // creates the connection to the server
  async _createHandshake(){
    // already connected to server (probably trying to join again after an invalid name)
    if(this.socket && this.socket.readyState === 1 && this.settings){
      return this.settings;
    }
    const data = await token.resolve(this.gameid,this);
    return new Promise((res,rej)=>{
      if(data.data && !data.data.isChallenge){
        const options = this._defaults.wsproxy(`wss://kahoot.it/cometd/${this.gameid}/${data.token}`);
        let info = [options.options];
        if(options.protocols){
          info.splice(0,0,options.protocols);
        }
        if(typeof options.readyState === "number" && typeof options.close === "function"){
          // assume websocket proxy returned a websocket
          this.socket = options;
        }else{
          this.socket = new ws(options.address,...info);
        }
      }else{
        this.socket = new ChallengeHandler(this,data);
      }
      this.socket.on("close",()=>{

        /**
         * Emitted when the client is disconnected. Emits a String with the reason the client was disconnected.
         * @event Client#Disconnect
         * @type {String}
         */
        this.emit("Disconnect",this.disconnectReason || "Lost Connection");
      });
      this.socket.on("open",()=>{
        this._send(new this.classes.LiveClientHandshake(0));
      });
      this.socket.on("message",(message)=>{
        this._message(message);
      });
      this.socket.on("error",()=>{
        this.emit("HandshakeFailed");
        try{this.socket.close();}catch(e){}
      });
      this.on("HandshakeComplete",()=>{
        res(data.data);
      });
      this.on("HandshakeFailed",()=>{
        rej({description:"HandshakeFailed"});
      });
    });
  }

  async _send(message,callback){
    if(this.socket && this.socket.readyState === 1){
      if(typeof message === "undefined" || message === null){
        throw "empty_message";
      }
      return new Promise((res)=>{
        if(message.length){
          message[0].id = (++this.messageId) + "";
          this.socket.send(JSON.stringify(message),res);
        }else{
          message.id = (++this.messageId) + "";
          this.socket.send(JSON.stringify([message]),res);
        }
        if(this.loggingMode){console.log("SEND: " + JSON.stringify([message]));}
        if(callback){
          const id = this.messageId + "";
          this.waiting[id] = callback;
          setTimeout(()=>{
            if(this.waiting[id]){
              // event timed out? (took over 10 seconds)
              callback(null);
              delete this.waiting[id];
            }
          },10e3);
        }
      });
    }
  }

  _message(message){
    if(this.loggingMode){console.log("RECV: " + message);}
    for(let i in this.handlers){
      this.handlers[i](JSON.parse(message)[0]);
    }
  }

  _emit(evt,payload){
    if(!this.quiz){
      this.quiz = {};
    }
    if(payload && payload.quizQuestionAnswers){
      this.quiz.quizQuestionAnswers = payload.quizQuestionAnswers;
    }
    if(payload && payload.questionIndex !== undefined){
      if(!this.quiz.currentQuestion){this.quiz.currentQuestion = {};}
      Object.assign(this.quiz.currentQuestion,payload);
    }
    if(!this.connected){
      this.lastEvent = arguments;
    }else{
      this.emit.apply(this,arguments);
    }
  }
}

/**
 * The default settings for the client.
 * @namespace Client#defaults
 * @type {Object}
 */
Client.prototype._defaults = {

  /**
   * An object containing the modules to load or not load.
   * @namespace Client#defaults.modules
   * @type {Object}
   * @property {Boolean} extraData Enable additional shortcuts, functions, and properties on various events.
   * @property {Boolean} feedback Enable the [Feedback]{@link Client#event:Feedback} event and the {@link Client#sendFeedback} method
   * @property {Boolean} gameReset Enable the [GameReset]{@link Client#event:GameReset} event
   * @property {Boolean} quizStart Enable the [QuizStart]{@link Client#event:QuizStart} event
   * @property {Boolean} quizEnd Enable the [QuizEnd]{@link Client#event:QuizEnd} event
   * @property {Boolean} podium Enable the [Podium]{@link Client#event:Podium} event
   * @property {Boolean} timeOver Enable the [TimeOver]{@link Client#event:TimeOver} event
   * @property {Boolean} reconnect Enable the {@link Client#reconnect} method
   * @property {Boolean} questionReady Enable the [QuestionReady]{@link Client#event:QuestionReady} event
   * @property {Boolean} questionStart Enable the [QuestionStart]{@link Client#event:QuestionStart} event
   * @property {Boolean} questionEnd Enable the [QuestionEnd]{@link Client#event:QuestionEnd} event
   * @property {Boolean} nameAccept Enable the [NameAccept]{@link Client#event:NameAccept} event
   * @property {Boolean} teamAccept Enable the [TeamAccept]{@link Client#event:TeamAccept} event
   * @property {Boolean} teamTalk Enable the [TeamTalk]{@link Client#event:TeamTalk} event
   * @property {Boolean} backup Enable the [RecoveryData]{@link Client#event:RecoveryData} event
   * @property {Boolean} answer Enable the {@link Client#answer} method
   */
  modules: {
    extraData: true,
    feedback: true,
    gameReset: true,
    quizStart: true,
    quizEnd: true,
    podium: true,
    timeOver: true,
    reconnect: true,
    questionReady: true,
    questionStart: true,
    questionEnd: true,
    nameAccept: true,
    teamAccept: true,
    teamTalk: true,
    backup: true,
    answer: true
  },
  /**
   * A function to proxy kahoot.js-updated's http requests
   * @function Client#defaults.proxy
   * @param {Object} options The default [HTTP Request]{@link https://nodejs.org/api/http.html#http_http_request_options_callback} options used by Kahoot.js
   * @returns {Object} The modified [HTTP Request]{@link https://nodejs.org/api/http.html#http_http_request_options_callback} options to proxy the request.
   */
  proxy: (options)=>{}, // Take in [HTTP Request]{@link https://nodejs.org/api/http.html#http_http_request_options_callback}, return and modify new options for the request for the proxied request. You may also return a ClientRequest as well. See Documentation.md
  /**
   * A function to proxy kahoot.js-updated's websocket requests
   * @function Client#defaults.wsproxy
   * @param {String} url The default websocket URI that Kahoot.JS sends the socket to.
   * @returns {Client#defaults.wsproxy.WsProxyReturn} [WS Options]{@link https://github.com/websockets/ws/blob/HEAD/doc/ws.md#new-websocketaddress-protocols-options} used to create the proxied socket. You may also return a WebSocket itself. See Documentation.md
   */
  wsproxy: (url)=>{return {address: url};}, // Take in [WS Options]{@link https://github.com/websockets/ws/blob/HEAD/doc/ws.md#new-websocketaddress-protocols-options}. Return and modify the options for the new proxied websocket connection
  /**
   * A list of options used in Challenges
   * @namespace Client#defaults.options
   * @type {Object}
   * @property {Boolean} ChallengeAutoContinue Automatically continue through challenge events. Default: <code>true</code>
   * @property {Boolean} ChallengeGetFullScore Always get the full score. Default: <code>false</code>
   * @property {Boolean} ChallengeAlwaysCorrect Always get the questions "correct" in challenges. Default: <code>false</code>
   * @property {Boolean} ChallengeUseStreakBonus Use the answer streak bonuses. Default: <code>false</code>
   * @property {Boolean} ChallengeWaitForInput Wait for answers before continuing to the next question. Default: <code>false</code>
   * @property {Number} ChallengeScore A set score to earn each question. (0-1,500) Default: <code>null</code>
   */
  options: {
    ChallengeAutoContinue: true,
    ChallengeGetFullScore: false,
    ChallengeAlwaysCorrect: false,
    ChallengeUseStreakBonus: false,
    ChallengeWaitForInput: false,
    ChallengeScore: null
  }
};

module.exports = Client;

/**
  * @namespace Client#defaults.wsproxy.WsProxyReturn
  * @type {Object}
  * @property {String} address The websocket URL
  * @property {String[]} protocols The list of protocols to use
  * @property {Object} options The websocket options to use (see above link).
  */
