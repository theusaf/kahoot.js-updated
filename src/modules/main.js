const LiveClientHandshake = require("../assets/LiveClientHandshake.js");

module.exports = function(){
  this.classes.LiveClientHandshake = LiveClientHandshake;
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
        this._send(new LiveClientHandshake(1,this._timesync));
        delete this.handlers.HandshakeChecker; // no more need.
      }else{
        // error!
        this.emit("HandshakeFailed",message);
        this.socket.close();
      }
    }
  };;
  this.handlers.PingChecker = (message)=>{
    if(message.channel === "/meta/connect" && message.ext){
      if(message.reconnect === "retry"){
        this.emit("HandshakeComplete");
      }
      this._send(new LiveClientHandshake(2,message,this));
    }
  };
};
