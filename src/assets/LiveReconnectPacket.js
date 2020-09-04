const LiveBaseMessage = require("./LiveBaseMessage.js");
module.exports = class LiveReconnectPacket extends LiveBaseMessage{
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
};
