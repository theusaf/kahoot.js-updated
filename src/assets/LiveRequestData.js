const LiveBaseMessage = require("./LiveBaseMessage.js");
module.exports = class LiveRequestData extends LiveBaseMessage{
  constructor(client){
    super(client,"/service/controller",{
      id: 16,
      type: "message",
      gameid: client.gameid,
      host: "kahoot.it",
      content: ""
    });
  }
};
