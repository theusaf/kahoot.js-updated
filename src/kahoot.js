const EventEmitter = require("events");
const token = require("./util/token.js");
const ws = require("ws");
const sleep = require("./util/sleep.js");
const ua = require("user-agents");

// A Kahoot! client.
class Client extends EventEmitter{

  /**
   * constructor - Create a Kahoot! client.
   *
   * @param  {Object} options Sets up the client. Options can control what events and methods are available to the client. By default, all options are enabled, besides proxies.
   * modules:
   * - extraData: enable extra aliases, functions, and data
   * - feedback: enable feedback events/methods
   * - gameReset: enable gamereset events
   * - twoFactor: enable two factor events/methods
   * - quizEnd: enable quizend events
   * - quizStart: enable quizstart events
   * - podium: enable podium (quiz end) events
   * - timetrack: enable timetrack events
   * - timeOver: enable timeover events (question end)
   * - reconnect: enable reconnect methods
   * - questionReady: enable question ready events
   * - questionStart: enable question start events
   * - questionEnd: enable question end events
   * - nameAccept: enable name accept events
   * - teamAccept: enable team accept events
   * - teamTalk: enable team talk events
   * - backup: enable backup events
   * options:
   * - ChallengeAutoContinue: true (fake events for challenges)
   * - ChallengeGetFullScore: false (always 1000 points for challenges)
   * - loggingMode: false (if set to true, it will log all messages to/from the server)
   * proxy (req):
   * - A function that takes a [HTTP.request options]{@link https://nodejs.org/api/http.html#http_http_request_options_callback}. The options will be set to lead to one of Kahoot's URIs.
   * -- This should return the methods/urls needed to complete requests though the proxy
   * wsproxy (url):
   * - url (String): The url that kahoot.js would usually send the websocket to.
   * - A function that returns options used in [ws]{@link https://github.com/websockets/ws/blob/HEAD/doc/ws.md#new-websocketaddress-protocols-options}
   * @example
   * // output
   * {
   *   address: "some_url",
   *   options: {},
   *   protocols: []
   * }
   */
  constructor(options){
    options = options || {};
    super();
    // assign options
    this.defaults = {};
    for(let i in this._defaults){
      this.defaults[i] = {};
      Object.assign(this.defaults[i],this._defaults[i]);
    }
    Object.assign(this.defaults.options,options.options);
    Object.assign(this.defaults.modules,options.modules);
    this.defaults.proxy = options.proxy || this.defaults.proxy;

    this.classes = {};
    this.handlers = {};
    this.waiting = {};

    // apply modules
    for(let mod in this.defaults.modules){
      if(this.defaults.modules[mod] || this.defaults.modules[mod] === undefined){
        try{require("./modules/" + mod + ".js").call(this);}catch(err){}
      }
    }

    // apply main modules
    require("./modules/main.js").call(this);

    this.userAgent = (new ua()).toString();
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
   * @see {@link join}
   * @returns {Object}      Returns the {@link Client} instead of a Promise.
   * @param {Client} client The newly created client joining the game
   * @param {Promise<LiveEventTimetrack>} event @see {@link join}
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
   * answerTwoFactorAuth - Answer the Two Factor Authentification
   *
   * @param  {Number[]} [steps=[0,1,2,3]] A list of four numbers (0,1,2,3). Each number represents one of the four colors in the two-factor code (red,blue,yellow,green) respectively
   * @returns {Promise} Resolves when the message is sent and received. Rejects if the message fails to send.
   */
  async answerTwoFactorAuth(steps){
    steps = steps || [0,1,2,3];
    const wait = Date.now() - this.twoFactorResetTime;
    if(wait < 250){
      await sleep(250 - wait);
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
   * join - Join a game. Also joins with team members.
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
    await sleep(0.5);
    await this._send(new this.classes.LiveJoinPacket(this,name));
    return new Promise((resolve,reject)=>{
      this.handlers.JoinFinish = async (message)=>{
        if(message.channel === "/service/status"){
          this.emit("status",message.data);
          if(message.data.status === "LOCKED"){
            reject(message.data);
            delete this.handlers.JoinFinish;
            return;
          }
        }
        if(message.channel === "/service/controller" && message.data && message.data.type === "loginResponse"){
          if(message.data.error){
            reject(message.data);
          }else{
            this.cid = message.data.cid;
            if(settings.gameMode === "team"){
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
                this.emit("joined",settings);
                if(!this.settings.twoFactorAuth){
                  this.connected = true;
                }else{
                  this.emit("TwoFactorReset");
                }
                resolve(settings);
              }else{
                this.emit("joined",settings);
                if(this.settings.twoFactorAuth){
                  this.emit("TwoFactorReset");
                }
                resolve(settings);
              }
            }else{

              /**
               * Join event
               * Emitted when the client joins the game
               *
               * @event Client#join
               * @type {Object}
               * @property {String<Function>} challenge The challenge function. (Pointless)
               * @property {Boolean} namerator Whether the game has the friendly name generator on.
               * @property {Boolean} participantId
               * @property {Boolean} smartPractice
               * @property {Boolean} twoFactorAuth Whether the game has twoFactorAuth enabled
               * @property {String|undefined} gameMode If the gameMode is 'team,' then it is team mode, else it is the normal classic mode.
               */
              this.emit("joined",settings);
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
   * joinTeam - Send team members
   *
   * @param  {String[]} [team=["Player 1","Player 2","Player 3","Player 4"]] A list of team members names
   * @returns {Promise<Object>} Resolves when the team members are sent. Rejects if for some reason the message was not received by Kahoot!'s server.
   * - see {@link https://kahoot.js.org/#/enum/LiveEventTimetrack}
   */
  async joinTeam(team,s){
    team = team || ["Player 1","Player 2","Player 3","Player 4"];
    if(this.settings.gameMode !== "team"){
      throw "The gameMode is not 'team'.";
    }
    return new Promise((resolve,reject)=>{
      this._send(new this.classes.LiveJoinTeamPacket(this,team),(r)=>{
        if(r === null || !r.successful){
          reject(r);
        }else{
          !s && this.emit("joined",this.settings);
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

  // creates the connection to the server
  async _createHandshake(){
    // already connected to server (probably trying to join again after an invalid name)
    if(this.socket && this.socket.readyState === 1 && this.settings){
      return this.settings;
    }
    const data = await token.resolve(this.gameid,this);
    return new Promise((res,rej)=>{
      const options = this._defaults.wsproxy(`wss://kahoot.it/cometd/${this.gameid}/${data.token}`);
      let info = [options.options];
      if(options.protocols){
        info.splice(0,0,options.protocols);
      }
      this.socket = new ws(options.address,...info);
      this.socket.on("close",()=>{
        this.emit("disconnect",this.disconnectReason || "Lost Connection");
      });
      this.socket.on("open",()=>{
        this._send(new this.classes.LiveClientHandshake(0));
      });
      this.socket.on("message",(message)=>{
        this._message(message);
      });
      this.on("HandshakeComplete",()=>{
        res(data.data);
      });
      this.on("HandshakeFailed",rej);
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
        if(this.loggingMode){console.log("SEND: " + JSON.stringify(message));}
        if(callback){
          this.waiting[this.messageId] = callback;
          setTimeout(()=>{
            if(this.waiting[this.messageId]){
              // event timed out? (took over 10 seconds)
              callback(null);
              delete this.waiting[this.messageId];
            }
          },10e3);
        }
      });
    }
  }

  _message(message){
    if(this.loggingMode){console.log("RECV: " + JSON.stringify(message));}
    for(let i in this.handlers){
      this.handlers[i](JSON.parse(message))[0];
    }
  }

  _emit(evt,payload){
    if(!this.quiz){
      this.quiz = {
        get questionCount(){return (this.quizQuestionAnswers && this.quizQuestionAnswers.length) || 10;}
      };
    }
    if(payload.quizQuestionAnswers){
      this.quiz.quizQuestionAnswers = payload.quizQuestionAnswers;
    }
    if(payload.questionIndex !== undefined){
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

// default options
Client.prototype._defaults = {
  modules: {
    extraData: true,
    feedback: true, // Allows the "Feedback" event and the sendFeedback method.
    gameReset: true, // Allows the "GameReset" event.
    quizStart: true, // Allows the "QuizStart" event.
    quizEnd: true, // Allows the "QuizEnd" event.
    podium: true, // Allows the "Podium" event.
    timeOver: true, // Allows the "TimeOver" event.
    reconnect: true, // Allows reconnecting
    questionReady: true, // Allows the "QuestionReady" event.
    questionStart: true, // Allows the "QuestionStart" event.
    questionEnd: true, // Allows the "QuestionEnd" event.
    nameAccept: true, // Allows the "NameAccept" event.
    teamAccept: true, // Allows the "TeamAccept" event. May emit more events if backup is enabled.
    teamTalk: true, // Allows the "TeamTalk" event
    backup: true, // Allows "recovery" events to be emitted. (This will also emit other events based on the recovery info.)
    answer: true // Allows answering the question.
  },
  proxy: ()=>{},
  wsproxy: (url)=>{return {address: url};},
  options: {
    ChallengeAutoContinue: true,
    ChallengeGetFullScore: false
  }
};

module.exports = Client;
