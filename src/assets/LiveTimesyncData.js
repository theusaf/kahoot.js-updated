module.exports = class LiveTimesyncData{
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
};
