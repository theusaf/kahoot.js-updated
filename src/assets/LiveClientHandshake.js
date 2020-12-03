const LiveTimesyncData = require("./LiveTimesyncData.js");
module.exports = class LiveClientHandshake{
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
};
