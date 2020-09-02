const LiveBaseMessage = require("./LiveBaseMessage.js");
module.exports = class LiveLeavePacket extends LiveBaseMessage{
  constructor(client){
    super(client,"/meta/disconnect");
    Object.assign(this.ext,{
      timesync: Date.now()
    });
  }
};
