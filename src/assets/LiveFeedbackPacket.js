const LiveBaseMessage = require("./LiveBaseMessage.js");
module.exports = class LiveFeedbackPacket extends LiveBaseMessage{
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
};
