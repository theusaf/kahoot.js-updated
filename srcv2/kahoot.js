const EventEmitter = require("events");

class Client extends EventEmitter{

  /**
   * constructor - Create a Kahoot! client.
   *
   * @param  {Object} options Sets up the client. Options can control what events and methods are available to the client. By default, all options are enabled, besides proxies.
   * modules:
   * - feedback: enable feedback events/methods
   * - gameReset: enable gamereset events
   * - twoFactor: enable two factor events/methods
   * - quizEnd: enable quizend events
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
   * - A function that takes a [HTTP.ClientRequest]{@link https://nodejs.org/api/http.html#http_class_http_clientrequest} argument
     * This should modify any methods/urls needed to complete requests
   * wsproxy (url):
   * - url: The url that kahoot.js would usually send the websocket to.
   * - A function that returns options used in [ws]{@link https://github.com/websockets/ws/blob/HEAD/doc/ws.md#new-websocketaddress-protocols-options}
   */
  constructor(options){
    // assign options
    Object.assign(this._defaults.options,options.options);
    Object.assign(this._defaults.modules,options.modules);
    this._defaults.proxy = options.proxy || this._defaults.proxy;

    // apply modules
    for(let mod in this._defaults.modules){
      if(this._defaults.modules[mod] || this._defaults.modules[mod] === undefined){
        try{Object.assign(this,require("./modules/" + mod + ".js"));}catch(err){}
      }
    }

    this.messageId = 0;
  }

  /**
   * @static defaults - Creates a new Client constructor
   *
   * @returns {class}  Returns a new Client constructor which uses new defaults
   */
  static defaults(options){
    let clone = Object.assign(Object.create(Object.getPrototypeOf(Client)),Client);
    Object.assign(clone.prototype._defaults,options);
    return clone;
  }

  /**
   * @static join - Creates a {@link Client} and joins the game
   *
   * @see {@link join}
   * @returns {Client}      Returns the {@link Client} instead of a Promise.
   */
  static join(){
    const client = new this;
    client.join.apply(client,arguments);
    return client;
  }

  /**
   * join - Join a game. Also joins with team members.
   *
   * @param  {String} name The name of the player
   * @param  {(String[]|Boolean)} [team=["Player 1","Player 2","Player 3","Player 4"]] The team member names.
   * if false, the team members will not be added automatically.
   * @returns {Promise<Object>}      Resolves when join succeeds
   */
  join(pin,name,team){

  }

  /**
   * _send - sends a message to the websocket
   *
   * @param  {Object} message The JSON message
   * @returns {Promise<String>}         resolves when the
   */
  _send(message){
    if(this.socket && this.socket.readyState === 1){
      if(typeof message === "undefined" || message === null){
        return new Promise((res,rej)=>{rej("empty_message");});
      }
      if(message.length){
        message[0].id = (this.messageId++) + "";
        this.socket.send(JSON.stringify(message));
      }else{
        message.id = (this.messageId++) + "";
        this.socket.send(JSON.stringify([message]));
      }
    }
  }
}

// default options
Client.prototype._defaults = {
  modules: {
    feedback: true,
    gameReset: true,
    twoFactor: true,
    quizEnd: true,
    podium: true,
    timetrack: true,
    timeOver: true,
    reconnect: true,
    questionReady: true,
    questionStart: true,
    questionEnd: true,
    nameAccept: true,
    teamAccept: true,
    teamTalk: true,
    backup: true,
  },
  proxy: ()=>{},
  wsproxy: ()=>{},
  options: {
    ChallengeAutoContinue: true,
    ChallengeGetFullScore: false,
    loggingMode: false
  }
};
