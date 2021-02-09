(()=>{
  if (typeof window === "undefined") {
    console.warn("kahoot.js-updated/browser is meant to be run in the browser");
  }
  const modules = {
    answer: function(){

      /**
       * Answer a question
       * @function Client#answer
       *
       * @param {(Number|String|Number[])} choice The answer to the question
       * - defaults:
       * - 1 answer, number: 0
       * - multi answer: [0,1,2,3]
       * - "undefined"
       * @returns {Promise<LiveEventTimetrack>} Resolves when answer is received.
       */
      this.answer = async (choice)=>{
        let wait = Date.now() - this.questionStartTime;
        if(isNaN(wait)){
          wait = 0;
        }
        if(wait < 250){
          await sleep((250 - wait) / 1000);
        }
        return new Promise((resolve, reject)=>{
          this._send(new LiveQuestionAnswer(this,choice),(result)=>{
            if(!result || !result.successful){
              reject(result);
            }else{
              resolve(result);
            }
          });
        });
      };
    },
    backup: function(){

      /**
       * @function client.requestRecoveryData - Request recovery information from the server
       *
       * @returns {Promise} Resolves when request is sent and received.
       */
      this.requestRecoveryData = async()=>{
        await sleep(0.5);
        return new Promise((resolve)=>{
          this._send(new LiveRequestData(this),(r)=>{
            resolve();
          });
        });
      };
      this.handlers.recovery = (message)=>{
        if(message.channel === "/service/player" && message.data && message.data.id === 17){
          const recover = JSON.parse(message.data.content);

          /**
           * Emitted when the server sends its recovery data.
           * This event is mostly for debugging.
           *
           * @event Client#RecoveryData
           * @see {@link https://kahoot.js.org/#/enum/LiveEventRecoveryData}
           */
          this.emit("RecoveryData",recover);
          if(!this.quiz){
            this.quiz = {
              get questionCount(){return (this.quizQuestionAnswers && this.quizQuestionAnswers.length) || 10;}
            };
          }
          this.quiz.quizQuestionAnswers = recover.defaultQuizData.quizQuestionAnswers;
          const data = recover.data;
          switch (recover.state) {
            case 0:{
              break;
            }
            case 1:{
              this._emit("QuizStart",data);
              break;
            }
            case 2:{
              this._emit("QuestionReady",data.getReady);
              break;
            }
            case 3:{
              this._emit("QuestionStart",data);
              break;
            }
            case 4:
            case 5:{
              this._emit("TimeUp",data);
              if(data.revealAnswer){
                this._emit("QuestionEnd",data.revealAnswer);
              }
              break;
            }
            case 6:{
              this._emit("QuizEnd",data);
              break;
            }
            case 7:{
              this._emit("Feedback");
              break;
            }
          }
        }
      };
      if(this.defaults.reconnect){
        this.on("Joined",()=>{
          if(this.reconnectRecovery){
            this.requestRecoveryData();
          }
        });
      }
      this.once("NameAccept",this.requestRecoveryData);
    },
    extraData: function(){
      const self = this;
      this.data.totalScore = 0;
      this.data.streak = 0;
      this.data.rank = 1;
      this.on("GameReset",()=>{
        this.data.totalScore = 0;
        this.data.rank = 0;
        this.data.streak = 0;
        delete this.quiz;
      });
      this.on("QuestionStart",(event)=>{
        Object.assign(event,{
          get answer(){
            return self.answer;
          },
          get type(){
            return event.type;
          },
          get index(){
            return event.questionIndex;
          }
        });
        try{
          Object.assign(self.quiz.currentQuestion,event);
        }catch(e){}
      });
      this.on("QuizStart",(event)=>{
        Object.assign(event,{
          get questionCount(){
            return event.quizQuestionAnswers.length;
          }
        });
        try{
          Object.assign(self.quiz,event);
        }catch(e){}
      });
      this.on("QuestionReady",(event)=>{
        Object.assign(event,{
          get type(){
            return event.gameBlockType;
          },
          get index(){
            return event.questionIndex;
          }
        });
        try{
          Object.assign(self.quiz.currentQuestion,event);
        }catch(e){}
      });
      this.on("QuestionEnd",(event)=>{
        if(event.hasAnswer === false){
          return;
        }
        this.data.totalScore = event.totalScore;
        this.data.streak = event.pointsData.answerStreakPoints.streakLevel;
        this.data.rank = event.rank;
      });
    },
    feedback: function(){

      /**
       * feedback - Handles the Feedback event
       * @param {Object} message The websocket message
       */
      this.handlers.feedback = (message)=>{
        if(message.channel === "/service/player" && message.data && message.data.id === 12){

          /**
           * Emitted when the host requests for feedback
           *
           * @event Client#Feedback
           * @type {Object}
           * @property {String} quizType
           */
          this.feedbackTime = Date.now();
          this._emit("Feedback",JSON.parse(message.data.content));
        }
      };

      /**
       * Send feedback to the host
       * @function Client#sendFeedback
       * @param {Number} fun 1-5. Rating for how fun the quiz was
       * @param {Number} learn 0/1. Whether the client learned anything from the quiz
       * @param {Number} recommend 0/1. Whether the client would recommend the quiz
       * @param {Number} overall -1 - 1. The overall feeling of the client.
       * @returns {Promise<LiveEventTimetrack>} Resolves when the feedback has been sent.
       */
      this.sendFeedback = async (fun,learn,recommend,overall)=>{
        if(this.gameid[0] === "0"){
          throw "Cannot send feedback in Challenges";
        }
        const wait = Date.now() - this.feedbackTime;
        if(wait < 500){
          await sleep((500 - wait) / 1000);
        }
        return new Promise((resolve, reject)=>{
          this._send(new LiveFeedbackPacket(this,fun,learn,recommend,overall),(result)=>{
            if(!result || !result.successful){
              reject(result);
            }else{
              resolve(result);
            }
          });
        });
      };
    },
    gameReset: function(){

      /**
       * gameReset - Handles the GameReset event
       * @param {Object} message The websocket message
       */
      this.handlers.gameReset = (message)=>{
        if(message.channel === "/service/player" && message.data && message.data.id === 5){

          /**
           * Emitted when the host presses "play again" or continues to the next quiz in the list.
           *
           * @event Client#GameReset
           */
          this._emit("GameReset");
        }
      };
    },
    main: function(){
      this.classes.LiveTwoStepAnswer = LiveTwoStepAnswer;
      this.classes.LiveJoinPacket = LiveJoinPacket;
      this.classes.LiveClientHandshake = LiveClientHandshake;
      this.classes.LiveJoinTeamPacket = LiveJoinTeamPacket;
      this.classes.LiveLeavePacket = LiveLeavePacket;

      /**
       * HandshakeChecker - Handles the handshake to Kahoot!
       * @param {Object} message The incoming websocket message.
       */
      this.handlers.HandshakeChecker = (message)=>{
        if(message.channel === "/meta/handshake"){
          if(message.clientId){
            this.clientId = message.clientId;
            const serverTime = message.ext.timesync;
            const l = Math.round((Date.now() - serverTime.tc - serverTime.p) / 2);
            const o = serverTime.ts - serverTime.tc - l;
            this._timesync = {
              l,
              o,
              get tc(){
                return Date.now();
              }
            };
            this._send(new LiveClientHandshake(1,this._timesync,this));
            delete this.handlers.HandshakeChecker; // no more need.
          }else{
            // error!
            this.emit("HandshakeFailed",message);
            this.socket.close();
          }
        }
      };

      /**
       * PingChecker - Handles the ping/pong messages
       * @param {Object} message The incoming websocket message
       */
      this.handlers.PingChecker = (message)=>{
        if(message.channel === "/meta/connect" && message.ext){
          if(message.advice && message.advice.reconnect === "retry"){
            this.emit("HandshakeComplete");
          }
          this._send(new LiveClientHandshake(2,message,this));
        }
      };

      /**
       * timetrack - handles the 'timetrack' events
       * @param {Object} message The incoming websocket message
       */
      this.handlers.timetrack = (message)=>{

        /**
         * An object about the time events were received
         * @namespace {Object} LiveEventTimetrack
         *
         * @property {String} channel The channel the message is responding to
         * @property {Object} ext An object that looks like this:
         * @example
         * {
         *   "timetrack": 265834652 // date received
         * }
         * @property {String<Number>} id The message id this message is responding to
         * @property {Boolean} successful Whether the message was successful
         */
        if(this.waiting){
          if(this.waiting[message.id]){
            // hooray
            this.waiting[message.id](message);
            delete this.waiting[message.id];
          }
        }
      };

      /**
       * TwoFactor - handles the 2FA events
       * @param {Object} message the incoming websocket message
       */
      this.handlers.TwoFactor = (message)=>{
        if(this.settings && !this.settings.twoFactorAuth){
          delete this.handlers.TwoFactor;
          return;
        }
        if(message.channel === "/service/player" && message.data){
          if(message.data.id === 53){

            /**
             * TwoFactorReset Event. Emitted when the two-factor auth resets and hasn't been answered correctly yet
             *
             * @event Client#TwoFactorReset
             */
            this.twoFactorResetTime = Date.now();
            this.emit("TwoFactorReset");
          }else if(message.data.id === 51){

            /**
             * TwoFactorWrong Event. Emitted when the two-factor auth was answered incorrectly.
             *
             * @event Client#TwoFactorWrong
             */
            this.emit("TwoFactorWrong");
          }else if(message.data.id === 52){

            /**
             * TwoFactorCorrect Event. Emitted when the two-factor auth was answered correctly. Enables other events to start.
             *
             * @event Client#TwoFactorCorrect
             */
            this.connected = true;
            this.emit("TwoFactorCorrect");
            if(this.lastEvent){
              this.emit.apply(this,this.lastEvent);
            }
            delete this.lastEvent;
            delete this.twoFactorResetTime;
            delete this.handlers.TwoFactor;
          }
        }
      };

      /**
       * Disconnect - handles disconnection
       * @param {Object} message The incoming websocket message
       */
      this.handlers.Disconnect = (message)=>{
        if(message.channel === "/service/player" && message.data && message.data.id === 10){
          const content = JSON.parse(message.data.content);
          if(content.kickCode){
            this.disconnectReason = "Kicked";
          }else{
            this.disconnectReason = "Session Ended";
          }
          this.leave(true);
        }
      };
    },
    nameAccept: function(){

      /**
       * nameAccept - Handles the NameAccept event
       * @param {Object} message The websocket message
       */
      this.handlers.nameAccept = (message)=>{
        if(message.channel === "/service/player" && message.data && message.data.id === 14){
          const data = JSON.parse(message.data.content);
          this.name = data.playerName;

          /**
           * Emitted when the server has validated the client's name
           *
           * @event Client#NameAccept
           * @type {Object}
           * @property {String} playerName The player's name (may have changed from original value due to filter)
           * @property {String} quizType
           * @property {Boolean} playerV2
           */
          this.emit("NameAccept",data);
          delete this.handlers.nameAccept;
        }
      };
    },
    podium: function(){

      /**
       * podium - Handles the Podium event
       * @param {Object} message The websocket message
       */
      this.handlers.podium = (message)=>{
        if(message.channel === "/service/player" && message.data && message.data.id === 13){

          /**
           * Emitted at the end of the game (After "QuizEnd")
           *
           * @event Client#Podium
           * @type {Object}
           * @property {String} podiumMedalType A string about the podium medal. "gold", "silver", "bronze" are possible values. May be nonexistent or null.
           */
          this._emit("Podium",JSON.parse(message.data.content));
        }
      };
    },
    questionEnd: function(){

      /**
       * questionEnd - Handles the QuestionEnd event
       * @param {Object} message The websocket message
       */
      this.handlers.questionEnd = (message)=>{
        if(message.channel === "/service/player" && message.data && message.data.id === 8){

          /**
           * An event emitted at the end of the question. Contains ranking information.
           *
           * @event Client#QuestionEnd
           * @type {Object}
           * @property {(Number|Number[]|String)} choice The answer from the client
           * @property {String} type The question type
           * @property {Boolean} isCorrect Whether the client answered the question correctly
           * @property {String} text The text content of answers sent by the client
           * @property {Number} receivedTime The time (ms) when the answer was received
           * @property {Booean} pointsQuestion Whether the question offered points
           * @property {Number} points The amount of points earned from the question
           * @property {Number[]} correctChoices A list of the indexes of correct choices (used in multi select quizzes)
           * @property {Number} totalScore The total score of the client
           * @property {Number} rank The current position of the client
           * @property {PointsData} pointsData Extra information about the points data
           * @property {Nemesis} nemesis The nemesis
           */
          this._emit("QuestionEnd",JSON.parse(message.data.content));
        }
      };
    },
    questionReady: function(){

      /**
       * QuestionReady - Handles the QuestionReady event
       * @param {Object} message The websocket message
       */
      this.handlers.QuestionReady = (message)=>{
        if(message.channel === "/service/player" && message.data && message.data.id === 1){

          /**
           * Emitted when the question is about to start
           *
           * @event Client#QuestionReady
           * @type {Object}
           * @property {Number} questionIndex The question index
           * @property {String} gameBlockType The question type
           * @property {String} gameBlockLayout The question layout
           * @property {Number[]} quizQuestionAnswers An array of numbers, signifying the number of answer choices in each question
           * @property {Number} timeLeft The time in seconds before the quiz starts
           */
          this._emit("QuestionReady",JSON.parse(message.data.content));
        }
      };
    },
    quizEnd: function(){

      /**
       * quizEnd - Handles the QuizEnd event
       * @param {Object} message The websocket message
       */
      this.handlers.quizEnd = (message)=>{
        if(message.channel === "/service/player" && message.data && message.data.id === 3){

          /**
           * Emitted when the quiz ends.
           *
           * @event Client#QuizEnd
           * @type {Object}
           * @property {Number} rank The rank of the player
           * @property {String<Number>} cid The player id
           * @property {Number} correctCount The number of correct answers
           * @property {Number} incorrectCount The number of incorrect answers
           * @property {Boolean} isKicked Whether the player was kicked?
           * @property {Boolean} isGhost Whether the player is a ghost.
           * @property {Number} unansweredCount The number of unanswered questions.
           * @property {Number} playerCount The number of players in the game.
           * @property {Number} startTime The date (ms) when the quiz started.
           * @property {String} quizId The quiz uuid
           * @property {String} name The name of the player
           * @property {Number} totalScore The final score of the player.
           * @property {String} hostId
           * @property {null} challengeId
           * @property {Boolean} isOnlyNonPointGameBlockKahoot Whether the kahoot is only non-point questions?
           */
          this._emit("QuizEnd",JSON.parse(message.data.content));
        }
      };
    },
    quizStart: function(){

      /**
       * quizStart - handles the quizStart event
       * @param {Object} message The websocket message
       */
      this.handlers.quizStart = (message)=>{
        if(message.channel === "/service/player" && message.data && message.data.id === 9){

          /**
           * Emitted at the start of the quiz
           *
           * @event Client#QuizStart
           * @type {Object}
           * @property {String} quizType
           * @property {Number[]} quizQuestionAnswers A list of numbers stating how many answers are in each question.
           */
          this._emit("QuizStart",JSON.parse(message.data.content));
        }
      };
    },
    reconnect: function(){

      /**
       * reconnect to a game
       * @function Client#reconnect
       * @param {(Number|String)} [pin] The gameid to connect to
       * @param {String<Number>|Number} [cid] The client id to reconnect as
       */
      this.reconnect = async (pin,cid)=>{
        if(this.socket && this.socket.readyState === 1){
          throw "Already connected! If there is an issue, close the connection!";
        }
        pin = pin || this.gameid;
        cid = cid || this.cid;
        if(pin[0] === "0"){
          throw "Cannot reconnect to a Challenge.";
        }
        const settings = await this._createHandshake();
        this.settings = settings;
        // reconnect
        await sleep(0.5);
        await this._send(new LiveReconnectPacket(this,pin,cid));
        return new Promise((resolve, reject)=>{
          if(this.handlers.recovery){
            this.reconnectRecovery = true;
          }
          this.handlers.ReconnectFinish = async (message)=>{
            if(message.channel === "/service/controller" && message.data && message.data.type === "loginResponse"){
              if(message.data.error){
                reject(message.data);
                this.disconnectReason = message.description;
                this.leave(true);
              }else{
                this.cid = message.data.cid || cid;
                this.emit("Joined",settings);
                this.connected = true;
                resolve(settings);
              }
              delete this.handlers.ReconnectFinish;
            }
          };
        });
      };
    },
    teamAccept: function(){

      /**
       * teamAccept - handles the TeamAccept event
       * @param {Object} message The websocket message
       */
      this.handlers.teamAccept = (message)=>{
        if(message.channel === "/service/player" && message.data && message.data.id === 19){
          const data = JSON.parse(message.data.content);

          /**
           * Emitted when the team members were accepted.
           *
           * @event Client#TeamAccept
           * @type {Object}
           * @property {String[]} memberNames The team members names.
           * @property {RecoveryData} recoveryData The recovery data (contains the current event)
           */
          this.emit("TeamAccept",data);
          delete this.handlers.teamAccept;
          if(this.handlers.recovery){
            this.handlers.recovery({
              channel: "/service/player",
              data: {
                id: 17,
                content: JSON.stringify(data.recoveryData)
              }
            });
          }
        }
      };
    },
    teamTalk: function(){

      /**
       * teamTalk - Handles the TeamTalk event
       * @param {Object} message The websocket message
       */
      this.handlers.teamTalk = (message)=>{
        if(message.channel === "/service/player" && message.data && message.data.id === 20){

          /**
           * Emitted when team talk starts
           *
           * @event Client#TeamTalk
           * @type {Object}
           * @property {Number} questionIndex The current question index
           * @property {Number[]} quizQuestionAnswers A list about the number of choices per question.
           * @property {String} gameBlockType The question type
           * @property {String} gameBlockLayout The layout of the question
           * @property {Number} teamTalkDuration The number (in seconds) for team talk
           */
          this._emit("TeamTalk",JSON.parse(message.data.content));
        }
      };
    },
    timeOver: function(){

      /**
       * timeOver - Handles the TimeOver event
       * @param {Object} message The websocket message
       */
      this.handlers.timeOver = (message)=>{
        if(message.channel === "/service/player" && message.data && message.data.id === 4){

          /**
           * Emitted when time is over (before QuestionEnd)
           *
           * @event Client#TimeOver
           * @type {Object}
           * @property {Number} questionNumber The question index.
           */
          this._emit("TimeOver",JSON.parse(message.data.content));
        }
      };
    }
  };
  class LiveTimesyncData{
    constructor(n,l,o){
      switch (n) {
        case "1":{
          this.timesync = {
            l,
            o,
            tc: Date.now()
          };
          break;
        }
        default:{
          this.ack = true;
          this.timesync = {
            l: 0,
            o: 0,
            tc: Date.now()
          };
        }
      }
    }
  }
  class LiveBaseMessage{
    constructor(client,channel,data){
      this.channel = channel;
      this.clientId = client.clientId;
      if(data){this.data = data;}
      this.ext = {};
    }
  }
  class LiveClientHandshake{
    constructor(n,m,c){
      switch (n+"") {
      // ping
        case "2":{
          this.channel = "/meta/connect";
          this.ext = {
            ack: m.ext.ack,
            timesync: c._timesync
          };
          this.clientId = c.clientId;
          break;
        }
        // second handshake
        case "1":{
          this.advice = {
            timeout: 0
          };
          this.channel = "/meta/connect";
          this.ext = {
            ack: 0,
            timesync: new LiveTimesyncData(n,m.l,m.o)
          };
          this.clientId = c.clientId;
          break;
        }
        // First handshake
        default:{
          this.advice = {
            interval: 0,
            timeout: 60000
          };
          this.minimumVersion = "1.0";
          this.version = "1.0";
          this.supportedConnectionTypes = [
            "websocket",
            "long-polling"
          ];
          this.channel = "/meta/handshake";
          this.ext = new LiveTimesyncData(n);
        }
      }
    }
  }
  class LiveLeavePacket extends LiveBaseMessage{
    constructor(client){
      super(client,"/meta/disconnect");
      Object.assign(this.ext,{
        timesync: Date.now()
      });
    }
  }
  class LiveFeedbackPacket extends LiveBaseMessage{
    constructor(client,fun,learning,recommend,overall){
      super(client,"/service/controller",{
        id: 11,
        type: "message",
        gameid: client.gameid,
        host: "kahoot.it",
        content: JSON.stringify({
          totalScore: (client.data && client.data.totalScore) || 0,
          fun,
          learning,
          recommend,
          overall,
          nickname: client.name
        })
      });
    }
  }
  class LiveJoinPacket extends LiveBaseMessage{
    constructor(client,name){
      super(client,"/service/controller",{
        gameid: client.gameid,
        host: "kahoot.it",
        name: name || ["Johan Brand","Morten Versvik","Jamie Brooker"][Math.floor(Math.random()*3)],
        type: "login",
        content: JSON.stringify({
          device: {
            userAgent: client.userAgent,
            screen: {
              width: 1920,
              height: 1080
            }
          }
        })
      });
    }
  }
  class LiveJoinTeamPacket extends LiveBaseMessage{
    constructor(client,team){
      super(client,"/service/controller",{
        gameid: client.gameid,
        host: "kahoot.it",
        content: JSON.stringify(team),
        id: 18,
        type: "message"
      });
    }
  }
  class LiveQuestionAnswer extends LiveBaseMessage{
    constructor(client,choice){
      const question = (client.quiz && client.quiz.currentQuestion) || {};
      const type = question.gameBlockType || "quiz";
      let text = null;
      switch (type) {
        case "multiple_select_quiz":
        case "multiple_select_poll":
        case "jumble":
          if(typeof choice.length === "undefined" || typeof choice.push === "undefined"){
          // not an array.
            if(isNaN(choice)){
              choice = [0,1,2,3];
            }else{
              choice = [+choice];
            }
            if(type === "jumble" && choice.length !== 4){
              choice = [0,1,2,3];
            }
          }
          break;
        case "word_cloud":
        case "open_ended":
          text = choice + "";
          break;
        default:
          if(isNaN(choice)){
            choice = 0;
          }
          choice = Number(choice);
      }
      const content = {
        gameid: client.gameid,
        host: "kahoot.it",
        id: 45,
        type: "message"
      };
      if(text){
        content.content = JSON.stringify({
          text,
          questionIndex: question.questionIndex || 0,
          meta: {
            lag: client._timesync.l || 30
          },
          type
        });
      }else{
        content.content = JSON.stringify({
          choice,
          questionIndex: question.questionIndex || 0,
          meta: {
            lag: client._timesync.l || 30
          },
          type
        });
      }
      super(client,"/service/controller",content);
    }
  }
  class LiveReconnectPacket extends LiveBaseMessage{
    constructor(client,pin,cid){
      super(client,"/service/controller",{
        gameid: pin + "",
        host: "kahoot.it",
        content: JSON.stringify({
          device: {
            userAgent: client.userAgent,
            screen: {
              width: 1980,
              height: 1080
            }
          }
        }),
        cid: cid + "",
        type: "relogin"
      });
    }
  }
  class LiveRequestData extends LiveBaseMessage{
    constructor(client){
      super(client,"/service/controller",{
        id: 16,
        type: "message",
        gameid: client.gameid,
        host: "kahoot.it",
        content: ""
      });
    }
  }
  class LiveTwoStepAnswer extends LiveBaseMessage{
    constructor(client,sequence){
      super(client,"/service/controller",{
        id: 50,
        type: "message",
        gameid: client.gameid,
        host: "kahoot.it",
        content: JSON.stringify({
          sequence: sequence.join("")
        })
      });
    }
  }
  function sleep(n){
    return new Promise((res)=>{
      setTimeout(res,n*1e3);
    });
  }
  // Thanks to https://gist.github.com/monsur/706839
  function parseResponseHeaders(headerStr) {
    let headers = {};
    if (!headerStr) {
      return headers;
    }
    let headerPairs = headerStr.split("\u000d\u000a");
    for (let i = 0; i < headerPairs.length; i++) {
      let headerPair = headerPairs[i];
      // Can't use split() here because it does the wrong thing
      // if the header value has the string ": " in it.
      let index = headerPair.indexOf("\u003a\u0020");
      if (index > 0) {
        let key = headerPair.substring(0, index);
        let val = headerPair.substring(index + 2);
        headers[key] = val;
      }
    }
    return headers;
  }
  function got(options){
    const method = options.method || "GET",
      url = `${options.protocol}//${options.host || options.hostname}${options.port ? ":" + options.port : ""}${options.pathname || options.path}${options.search ? "?" + options.search : ""}`,
      xml = new XMLHttpRequest,
      body = options.body || options.json || options.form,
      json = options.json,
      form = options.form;
    xml.open(method,url);
    if(json){
      xml.setRequestHeader("Content-Type","application/json");
    }else if(form){
      xml.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    }
    if(options.headers){
      for(let i in options.headers){
        xml.setRequestHeader(i,options.headers[i]);
      }
    }
    const p = new Promise((res,rej)=>{
      if(body){
        xml.send(body);
      }else{
        xml.send();
      }
      xml.onload = function(){
        res({
          body: xml.response,
          headers: parseResponseHeaders(xml.getAllResponseHeaders())
        });
      };
      xml.onerror = function(e){
        rej(e);
      };
    });
    p.json = function(){
      return p.then((data)=>{
        return JSON.parse(data.body);
      });
    };
    return p;
  }
  class EventEmitter{
    constructor(){
      this.events = {};
    }
    on(event,cb){
      if(!this.callbacks[event]) this.callbacks[event] = [];
      this.callbacks[event].push(cb);
    }
    once(event,cb){
      const o = (data)=>{
        cb(data);
        this.off(o);
      };
      this.on(event,o);
    }
    off(event,cb){
      let cbs = this.callbacks[event];
      if(cbs){
        for(let i = 0; i < cbs.length; i++){
          if (cb === cbs[i]) {
            cbs.splice(i,1);
            break;
          }
        }
      }
    }
    emit(event,data){
      let cbs = this.callbacks[event];
      if(cbs){
        cbs.forEach(cb => cb(data));
      }
    }
  }
  class ws extends EventEmitter{
    constructor(url,protocols){
      super();
      this.socket = new WebSocket(url,protocols);
      this.socket.onopen = function(){
        this.emit("open");
      };
      this.socket.onclose = function(e){
        this.emit("close",e);
      };
      this.socket.onerror = function(e){
        this.emit("error",e);
      };
      this.socket.onmessage = function(e){
        this.emit("message",e.data);
      };
    }
    get readyState(){
      return this.socket.readyState;
    }
    get url(){
      return this.socket.url;
    }
    get protocol(){
      return this.socket.protocol;
    }
    send(data){
      this.socket.send(data);
    }
    close(){
      this.socket.close(...arguments);
    }
  }
  class token{

    /**
     * @static requestChallenge - Requests information about Kahoot! challenges.
     *
     * @param  {String<Number>} pin The gameid of the challenge the client is trying to connect to
     * @param  {Client} client The client
     * @returns {Promise<Object>} The challenge data
     */
    static async requestChallenge(pin,client){
      let tries = 0;
      async function handleRequest(){
        let options = {
          headers: {
            "User-Agent": navigator.userAgent,
            "Origin": "kahoot.it",
            "Referer": "https://kahoot.it/",
            "Accept-Language": "en-US,en;q=0.8",
            "Accept": "*/*"
          },
          host: "kahoot.it",
          protocol: "https:",
          path: `/rest/challenges/pin/${pin}`
        };
        const proxyOptions = client.defaults.proxy(options);
        options = proxyOptions || options;
        const request = got(options);
        client.emit("_Request", request);
        try{
          const data = await request.json();
          return {
            data: Object.assign({
              isChallenge: true,
              twoFactorAuth: false,
              kahootData: data.kahoot,
              rawChallengeData: data.challenge
            },data.challenge.game_options)
          };
        }catch(e){
          if(tries < 2){
            tries++;
            await sleep(2);
            return await handleRequest();
          }
          throw {
            description: "Failed to get challenge data",
            error: e
          };
        }
      }
      return await handleRequest();
    }

    /**
     * @static requestToken - Requests the token for live games.
     *
     * @param  {String<Number>} pin The gameid
     * @param  {Client} client The client
     * @returns {Promise<object>} The game options
     */
    static async requestToken(pin,client){
      let tries = 0;
      async function handleRequest(){
        let options = {
          headers: {
            "User-Agent": navigator.userAgent,
            "Origin": "kahoot.it",
            "Referer": "https://kahoot.it/",
            "Accept-Language": "en-US,en;q=0.8",
            "Accept": "*/*"
          },
          host: "kahoot.it",
          path: `/reserve/session/${pin}/?${Date.now()}`,
          protocol: "https:"
        };
        const proxyOptions = client.defaults.proxy(options);
        options = proxyOptions || options;
        const request = got(options);
        client.emit("_Request", request);
        try{
          const {headers,body} = await request,
            data = JSON.parse(body);
          if(!headers["x-kahoot-session-token"]){
            throw {
              description: "Missing header token (pin doesn't exist)"
            };
          }
          return {
            token: atob(headers["x-kahoot-session-token"]),
            data
          };
        }catch(e){
          tries ++;
          if(tries < 3){
            await sleep(2);
            return await handleRequest();
          }
          throw e.description ? e : {
            description: "Request failed or timed out.",
            error: e
          };
        }
      }
      return await handleRequest();
    }

    /**
     * @static solveChallenge - Solves the challenge for the various Kahoot! tokens.
     *
     * @param  {String} challenge The JS function to execute to get the challenge token.
     * @returns {String} The decoded token
     */
    static solveChallenge(challenge){
      let solved = "";
      challenge = challenge.replace(/(\u0009|\u2003)/mg, "");
      challenge = challenge.replace(/this /mg, "this");
      challenge = challenge.replace(/ *\. */mg, ".");
      challenge = challenge.replace(/ *\( */mg, "(");
      challenge = challenge.replace(/ *\) */mg, ")");
      // Prevent any logging from the challenge, by default it logs some debug info
      challenge = challenge.replace("console.", "");
      // Make a few if-statements always return true as the functions are currently missing
      challenge = challenge.replace("this.angular.isObject(offset)", "true");
      challenge = challenge.replace("this.angular.isString(offset)", "true");
      challenge = challenge.replace("this.angular.isDate(offset)", "true");
      challenge = challenge.replace("this.angular.isArray(offset)", "true");
      (() => {
        const EVAL_ = `var _ = {
          replace: function() {
            var args = arguments;
            var str = arguments[0];
            return str.replace(args[1], args[2]);
          }
        };
        var log = function(){};return `;
        // Concat the method needed in order to solve the challenge, then eval the string
        const solver = Function(EVAL_ + challenge);
        // Execute the string, and get back the solved token
        solved = solver().toString();
      })();
      return solved;
    }

    /**
     * @static concatTokens - Combines the two tokens to get the final token
     *
     * @param  {String} headerToken The base64 decoded header token
     * @param  {String} challengeToken The decoded challenge token
     * @returns {String} The final token
     */
    static concatTokens(headerToken, challengeToken) {
      // Combine the session token and the challenge token together to get the string needed to connect to the websocket endpoint
      for (var token = "", i = 0; i < headerToken.length; i++) {
        let char = headerToken.charCodeAt(i);
        let mod = challengeToken.charCodeAt(i % challengeToken.length);
        let decodedChar = char ^ mod;
        token += String.fromCharCode(decodedChar);
      }
      return token;
    }

    /**
     * @static resolve - The main function for getting token info
     *
     * @param  {String<Number>} pin The gameid
     * @param  {Client} client The client
     * @returns {Promise<Object>} The game information.
     */
    static resolve(pin,client){
      if(isNaN(pin)){
        return new Promise((res,reject)=>{
          reject({
            description: "Invalid/Missing PIN"
          });
        });
      }
      if(pin[0] === "0"){
        // challenges
        return this.requestChallenge(pin,client);
      }
      return this.requestToken(pin,client).then(data=>{
        const token2 = this.solveChallenge(data.data.challenge);
        const token = this.concatTokens(data.token,token2);
        return {
          token,
          data: data.data
        };
      });
    }
  }
  // overwrites functions
  const emoji = /\p{Emoji}/ug;
  function Injector(){
    this.data = this.data || {};
    Object.assign(this.data,{
      totalScore: 0,
      totalScoreNoBonus: 0,
      totalStreak: 0,
      streak: -1,
      phase: "start",
      questionIndex: 0,
      correctCount: 0,
      incorrectCount: 0,
      unansweredCount: 0
    });

    this.answer = async (choice,empty)=>{
      clearTimeout(this.ti);
      const question = this.challengeData.kahoot.questions[this.data.questionIndex];
      let tick = Date.now() - this.receivedQuestionTime;
      if(this.defaults.options.ChallengeGetFullScore || this.defaults.options.ChallengeWaitForInput || !this.challengeData.challenge.game_options.question_timer){
        tick = 1;
      }
      const pointsQuestion = this.challengeData.progress.questions.reverse()[0].pointsQuestion || false;
      if(+this.defaults.options.ChallengeScore > 1500){
        // Hard limit of 0 - 1,500. (anything higher = 0 on Kahoot's end)
        this.defaults.options.ChallengeScore = 1500;
      }else if(+this.defaults.options.ChallengeScore < 0){
        this.defaults.options.ChallengeScore = 0;
      }
      const timeScore = +this.defaults.options.ChallengeScore || ((Math.round((1 - ((tick / question.time) / 2)) * 1000) * question.pointsMultiplier) * +pointsQuestion);
      if(this.data.streak === -1){
        this.data.streak = 0;
        const ent = this.challengeData.progress.playerProgress.playerProgressEntries;
        let falseScore = 0;
        for(let q in ent){
          if(q >= this.data.questionIndex){
            break;
          }
          if(!ent[q].questionMetrics){
            break;
          }
          if(ent[q].questionMetrics[this.name] > falseScore || !this.challengeData.kahoot.questions[q].points){
            this.data.streak++;
          }else{
            this.data.streak = 0;
          }
          falseScore = ent[q].questionMetrics[this.name];
          this.data.score = falseScore;
        }
      }
      const alwaysCorrect = this.defaults.options.ChallengeAlwaysCorrect;
      let correct = false;
      let text = "";
      if(empty === null){
        choice = -1;
      }
      let choiceIndex = +choice;
      let c2 = [];
      let score = 0;
      switch (question.type) {
        case "quiz":{
          try{
            correct = question.choices[choiceIndex].correct;
            text = question.choices[choiceIndex].answer;
          }catch(e){
            correct = false;
            text = "";
          }finally{
            if(alwaysCorrect){correct = true;}
            if(correct){score+=timeScore;}
          }
          break;
        }
        case "jumble":{
          correct = JSON.stringify(choice) === JSON.stringify([0,1,2,3]);
          if(typeof choice != "object" || typeof choice.length === "undefined"){
            choice = [];
          }
          for(let j in choice){
            choice[j] = +choice[j];
          }
          let tmpList = [];
          for(let n of choice){
            try{
              tmpList.push(question.choices[n].answer);
            }catch(e){
              tmpList.push("");
            }
          }
          text = tmpList.join("|");
          choiceIndex = -1;
          if(alwaysCorrect){correct = true;}
          if(correct){score+=timeScore;}
          break;
        }
        case "multiple_select_quiz":{
          if(typeof choice != "object" || typeof choice.length === "undefined"){
            choice = [];
          }
          correct = true;
          let tmpList = [];
          for(let i in choice){
            choice[i] = +choice[i];
            tmpList.push(question.choices[i].answer);
          }
          tmpList = tmpList.join("|");
          for(let ch in question.choices){
            if(question.choices[ch].correct){
              c2.push(ch);
              if(choice.includes(+ch) || alwaysCorrect){
                if(correct){
                  score += timeScore;
                }
              }else{
                score = 0;
                correct = false;
              }
            }
          }
          break;
        }
        case "open_ended":{
          text = choice + "";
          const invalid = /[~`!@#$%^&*(){}[\];:"'<,.>?/\\|\-_+=]/gm;
          const test = text.replace(invalid,"");
          for(let choice of question.choices){
            if(choice.answer.replace(emoji,"")){
              correct = test.replace(emoji,"").toLowerCase() == choice.answer.replace(emoji,"").replace(invalid,"").toLowerCase();
            }else{
              correct = test == choice;
            }
            if(correct){
              choiceIndex = question.choices.indexOf(choice);
              break;
            }
          }
          if(alwaysCorrect){correct = true;}
          if(correct){score+=timeScore;}
          break;
        }
        case "word_cloud":{
          text = choice + "";
          choiceIndex = -1;
          correct = true;
          if(this.defaults.options.ChallengeScore){
            score += timeScore;
          }
          break;
        }
        default:{
          choiceIndex = +choice || 0;
          text = (question.choices[choiceIndex] && question.choices[choiceIndex].answer) || "";
          correct = true;
          if(this.defaults.options.ChallengeScore){
            score += timeScore;
          }
        }
      }
      let c = [];
      if(question.choices){
        for(let choice of question.choices){
          if(choice.correct){
            c.push(choice.answer);
          }
        }
      }
      const oldstreak = this.data.streak;
      if(correct){this.data.streak++;}else{this.data.streak = 0;}
      const payload = {
        device: {
          screen: {
            width: 1920,
            height: 1080
          },
          userAgent: this.userAgent
        },
        gameMode: this.challengeData.progress.gameMode,
        gameOptions: this.challengeData.progress.gameOptions,
        hostOriganizationId: null,
        kickedPlayers: [],
        numQuestions: this.challengeData.kahoot.questions.length,
        organizationId: "",
        question: {
          answers: [
            {
              bonusPoints: {
                answerStreakBonus: this._calculateStreakBonus()
              },
              choiceIndex,
              isCorrect: correct,
              playerCid: +this.cid,
              playerId: this.name,
              points: +correct * score,
              reactionTime: tick,
              receivedTime: Date.now(),
              text
            }
          ],
          choices: question.choices,
          duration: question.time,
          format: question.questionFormat,
          index: this.data.questionIndex,
          lag: 0,
          layout: question.layout,
          playerCount: 1,
          pointsQuestion,
          skipped: (empty === null),
          startTime: this.receivedQuestionTime,
          title: question.question,
          type: question.type,
          video: question.video
        },
        quizId: this.challengeData.kahoot.uuid,
        quizMaster: this.challengeData.challenge.quizMaster,
        quizTitle: this.challengeData.kahoot.title,
        quizType: this.challengeData.progress.quizType,
        sessionId: this.gameid,
        startTime: this.challengeData.progress.timestamp
      };
      // small changes for specific types
      switch (question.type) {
        case "word_cloud":
        case "open_ended":{
          Object.assign(payload.question.answers[0],{
            originalText: text,
            text: text.toLowerCase().replace(/[~`!@#$%^&*(){}[\];:"'<,.>?/\\|\-_+=]/gm,"")
          });
          payload.question.choices = [];
          break;
        }
        case "jumble":{
          let f = choice;
          if(f.length !== 4){
            f = [3,2,1,0];
          }
          payload.question.answers[0].selectedJumbleOrder = f;
          break;
        }
        case "multiple_select_quiz":{
          payload.question.answers[0].selectedChoices = choice;
          payload.question.answers[0].choiceIndex = -5;
          break;
        }
        case "content":{
          Object.assign(payload.question.answers[0],{
            choiceIndex: -2,
            isCorrect: true,
            reactionTime: 0
          });
          break;
        }}
      let oldScore = score;
      score += payload.question.answers[0].bonusPoints.answerStreakBonus;
      this.data.totalStreak += score - oldScore;
      this.data.totalScoreNoBonus += oldScore;
      this.data.totalScore += score;
      if(correct){this.data.correctCount++;}
      if(!correct && empty === null){this.data.unansweredCount++;}
      if(!correct && empty !== null){this.data.incorrectCount++;}
      const event = {
        choice,
        type: question.type,
        isCorrect: correct,
        text,
        receivedTime: Date.now(),
        pointsQuestion,
        points: score,
        correctChoices: c2,
        totalScore: this.data.totalScore,
        rank: this._getRank(),
        nemesis: this._getNemesis(),
        pointsData: {
          questionPoints: oldScore,
          totalPointsWithBonuses: this.data.totalScore,
          totalPointsWithoutBonuses: this.data.totalScoreNoBonus,
          answerStreakPoints: {
            streakLevel: (correct && this.data.streak) || 0,
            streakBonus: this._calculateStreakBonus(),
            totalStreakPoints: this.data.totalStreak,
            previousStreakLevel: oldstreak,
            previousStreakBonus: this._calculateStreakBonus(oldstreak)
          }
        },
        lastGameBlockIndex: this.data.questionIndex < 0 ? 0 : this.data.questionIndex - 1
      };
      this.data.finalResult = {
        rank: event.rank,
        cid: this.cid,
        correctCount: this.data.correctCount,
        incorrectCount: this.data.incorrectCount,
        unansweredCount: this.data.unansweredCount,
        isKicked: false,
        isGhost: false,
        playerCount: this.challengeData.challenge.challengeUsersList.length + 1,
        startTime: this.challengeData.progress.timestamp,
        quizId: this.challengeData.kahoot.uuid,
        name: this.name,
        totalScore: this.data.totalScore,
        hostId: "",
        challengeId: "",
        isOnlyNonPointGameBlockKahoot: false
      };
      return this._httpRequest(`https://kahoot.it/rest/challenges/${this.challengeData.challenge.challengeId}/answers`,{
        headers: {
          "Content-Type": "application/json",
          "Content-Length": (new TextEncoder().encode(JSON.stringify(payload))).length
        },
        method: "POST"
      },false,JSON.stringify(payload)).finally((data)=>{
        if(empty === null){
          return event;
        }
        this.ti = setTimeout(()=>{
          this._emit("TimeOver");
          this._emit("QuestionEnd",event);
          this.next();
        },1000);
        return;
      });
    };

    /**
     * next - Go to the next part (challenge)
     *
     * @function Client#next
     */
    this.next = ()=>{
      if(this.stop){
        return;
      }
      switch (this.data.phase) {
        case "start": {
          this.data.phase = "ready";
          const kahoot = this.challengeData.kahoot;
          let qqa = [];
          for(let question of kahoot.questions){
            qqa.push(question.choices ? question.choices.length : null);
          }
          this._emit("QuizStart",{
            name: kahoot.title,
            quizQuestionAnswers: qqa
          });
          setTimeout(()=>{this.next();},5000);
          break;
        }
        case "ready": {
          this._getProgress(this.data.questionIndex).then((inf)=>{
            if(this.data.hitError === true){this.data.hitError = false;}
            if(Object.keys(inf).length !== 0){
              this.challengeData.progress = inf;
            }
            this.data.phase = "answer";
            let q = this.challengeData.kahoot.questions[this.data.questionIndex];
            this._emit("QuestionReady",Object.assign(q,{
              questionIndex: this.data.questionIndex,
              timeLeft: 5,
              gameBlockType: q.type,
              gameBlockLayout: q.layout,
              quizQuestionAnswers: this.quiz.quizQuestionAnswers
            })).catch((e)=>{
              this.leave("Failed to fetch challenge progress.");
            });
            setTimeout(()=>{this.next();},5000);
          }).catch((err)=>{
            if(this.data.hitError){
              // Assume something is terribly wrong.
              clearTimeout(this.ti);
              this.leave("Kahoot - Internal Server Error");
            }
            this.data.hitError = true;
            this.next();
          });
          break;
        }
        case "answer": {
          let q = this.challengeData.kahoot.questions[this.data.questionIndex];
          this.receivedQuestionTime = Date.now();
          this.data.phase = "leaderboard";
          if(!q){
            this.leave("Unknown Error");
            return;
          }
          if(q.type === "content"){
            this.data.questionIndex++;
            this.data.phase = "ready";
            if(this.data.questionIndex === this.challengeData.kahoot.questions.length){
              this.data.phase = "close";
            }
            if(this.challengeData.challenge.game_options.question_timer && !this.defaults.options.ChallengeWaitForInput){
              setTimeout(()=>{
                this.next();
              },10000);
            }
            return;
          }
          if(this.challengeData.challenge.game_options.question_timer && !this.defaults.options.ChallengeWaitForInput){
            this.ti = setTimeout(async()=>{
              const evt = await this.answer(null,null);
              if(q.type !== "content"){
                this._emit("TimeOver");
                this._emit("QuestionEnd",evt);
              }
              this.next();
            },q.time || 5000);
            this._emit("QuestionStart",Object.assign(q,{
              questionIndex: this.data.questionIndex,
              gameBlockType: q.type,
              gameBlockLayout: q.layout,
              quizQuestionAnswers: this.quiz.quizQuestionAnswers,
              timeAvailable: q.time
            }));
            return;
          }
          this._emit("QuestionStart",Object.assign(q,{
            questionIndex: this.data.questionIndex,
            gameBlockType: q.type,
            gameBlockLayout: q.layout,
            quizQuestionAnswers: this.quiz.quizQuestionAnswers,
            timeAvailable: q.time
          }));
          // else, you must do everything yourself.
          break;
        }
        case "leaderboard":{
          this.data.questionIndex++;
          this.data.phase = "ready";
          if(this.data.questionIndex === this.challengeData.kahoot.questions.length){
            this.data.phase = "close";
            if(this.defaults.options.ChallengeAutoContinue){
              setTimeout(()=>{this.next();},5000);
            }
            return;
          }
          if(this.defaults.options.ChallengeAutoContinue){
            setTimeout(()=>{this.next();},5000);
          }
          break;
        }
        case "close":{
          this.data.phase = "complete";
          this._emit("QuizEnd",this.data.finalResult);
          this._emit("Podium",{
            podiumMedalType: ["gold","silver","bronze"][this._getRank() - 1]
          });
          if(this.defaults.options.ChallengeAutoContinue){
            setTimeout(()=>{
              this.next();
            },30000);
          }
          break;
        }
        case "complete":{
          this.leave("Session Ended");
        }
      }
    };

    this.leave = (reason)=>{
      this.stop = true;
      this.disconnectReason = reason || "Player Left";
      this.socket.close();
    };

    const joined = (cid)=>{
      setTimeout(()=>{this.socket.emit("message",JSON.stringify([{
        channel: "/service/controller",
        data: {
          type: "loginResponse",
          cid: cid+""
        }
      }]));});
      this._send = async ()=>{throw "This error should not appear unless you are trying to do something silly.";};
    };

    this._calculateStreakBonus = (i)=>{
      let info = i || this.data.streak;
      if(this.defaults.options.ChallengeUseStreakBonus){
        if(info >= 6){
          return 500;
        }else if(info > 0){
          return (info - 1) * 100;
        }else{
          return 0;
        }
      }else{
        return 0;
      }
    };

    this._send = async (m)=>{
      if(m.data && m.data.type === "login"){
        this.name = m.data.name + "";

        /**
         * @since 2.0.0
         * Removed reconnecting - Client id not provided.
         */
        return this._httpRequest(`https://kahoot.it/rest/challenges/${this.challengeData.challenge.challengeId}/join/?nickname=${encodeURIComponent(this.name)}`,{
          method: "POST"
        },true).then((data)=>{
          if(data.error){
            throw data;
          }
          Object.assign(this.challengeData,data);
          this.cid = data.playerCid;
          joined(this.cid);
          if(this.defaults.options.ChallengeAutoContinue){
            setTimeout(()=>{this.next();},5000);
          }
          return this.challengeData;
        }).catch(()=>{
          this.leave("Error connecting to Challenge");
        });
      }
    };

    this._httpRequest = async (url,opts,json,packet)=>{
      const parsed = new URL(url);
      let options = {
        headers: {
          "User-Agent": this.userAgent,
          "Origin": "kahoot.it",
          "Referer": "https://kahoot.it/",
          "Accept-Language": "en-US,en;q=0.8",
          "Accept": "*/*"
        },
        host: parsed.hostname,
        protocol: parsed.protocol,
        path: parsed.pathname + (parsed.search || ""),
        retry: 3,
        body: packet
      };
      for(let i in opts){
        if(typeof opts[i] === "object"){
          if(!options[i]){
            options[i] = opts[i];
          }else{
            Object.assign(options[i],opts[i]);
          }
        }else{
          options[i] = opts[i];
        }
      }
      const proxyOptions = this.defaults.proxy(options);
      options = proxyOptions || options;
      if(this.loggingMode){
        console.log("SEND: " + JSON.stringify({
          options,
          packet
        }));
      }
      const request = got(options);
      this.emit("_Request", request);
      const req = await request;
      if(json){
        return JSON.parse(req.body);
      }else{
        return req.body;
      }
    };

    this._getNemesis = ()=>{
      if(!this.challengeData.progress.playerProgress){
        return null;
      }
      const scores = Array.from(this.challengeData.progress.playerProgress.playerProgressEntries);
      const latest = scores.reverse()[0].questionMetrics;
      let rank = 0;
      let name = null;
      let totalScore = null;
      for(let i in latest){
        if(i === this.name){
          continue;
        }
        if(latest[i] >= this.data.totalScore){
          rank++;
          if(latest[i] < totalScore || name === null){
            name = i;
            totalScore = latest[i];
          }
        }
      }
      if(rank){
        return {
          name,
          isGhost: false,
          rank,
          totalScore
        };
      }
    };

    this._getRank = ()=>{
      const nem = this._getNemesis();
      if(nem){
        return nem.rank + 1;
      }else{
        return 1;
      }
    };

    this._getProgress = (q)=>{
      if(typeof q !== "undefined"){
        return this._httpRequest(`https://kahoot.it/rest/challenges/${this.challengeData.challenge.challengeId}/progress/?upToQuestion=${q}`,null,true);
      }else{
        return this._httpRequest(`https://kahoot.it/rest/challenges/pin/${this.gameid}`,null,true).then((data)=>{
          return this._httpRequest(`https://kahoot.it/rest/challenges/${data.challenge.challengeId}/progress`,null,true).then((data2)=>{
            return Object.assign(data,{progress:data2});
          });
        });
      }
    };

    this._getProgress().then(inf=>{
      if(Object.keys(inf.progress).length == 0){
        return this.leave("Invalid Challenge");
      }
      this.challengeData = inf;
      if(inf.challenge.endTime <= Date.now() || inf.challenge.challengeUsersList.length >= inf.challenge.maxPlayers){
        return this.leave("Challenge Ended/Full");
      }else{
        this.emit("HandshakeComplete");
      }
    }).catch((e)=>{
      this.leave("Failed to fetch challenge progress.");
    });
  }
  // pretends to be a websocket
  class ChallengeHandler extends EventEmitter{
    constructor(client,content){
      super();
      client.challengeData = content;
      Injector.call(client);
      this.readyState = 3;
      this.close = ()=>{
        this.stop = true;
        clearTimeout(client.ti);
        this.emit("close");
      };
    }
  }
  class KahootClient extends EventEmitter{

    /**
     * constructor - Create a Kahoot! client.
     *
     * @param  {Object} options Sets up the client. Options can control what events and methods are available to the client. By default, all options are enabled, besides proxies.
     *
     */
    constructor(options){
      options = options || {};
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
          try{modules[mod].call(this);}catch(err){}
        }
      }

      // apply main modules
      modules.main.call(this);

      this.userAgent = navigator.userAgent;
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
          this.socket = new ws(options.address,...info);
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
  window.KahootClient = KahootClient;
})();
