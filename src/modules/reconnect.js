const sleep = require("../util/sleep.js");
const LiveReconnectPacket = require("../assets/LiveReconnectPacket.js");
module.exports = function(){

  /**
   * @function client.reconnect - reconnect to a game
   *
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
    await this.send(new LiveReconnectPacket(this,pin,cid));
    return new Promise((resolve, reject)=>{
      this.handlers.ReconnectFinish = async (message)=>{
        if(message.channel === "/service/controller" && message.data && message.data.type === "loginResponse"){
          if(message.data.error){
            reject(message.data);
          }else{
            this.cid = message.data.cid || cid;
            this.emit("joined",settings);
            resolve(settings);
          }
          delete this.handlers.ReconnectFinish;
        }
      };
    });
  };
};
