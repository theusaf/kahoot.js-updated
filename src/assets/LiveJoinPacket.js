const LiveBaseMessage = require("./LiveBaseMessage.js");
module.exports = class LiveJoinPacket extends LiveBaseMessage{
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
};
