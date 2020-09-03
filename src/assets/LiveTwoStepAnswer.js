const LiveBaseMessage = require("./LiveBaseMessage.js");
module.exports = class LiveTwoStepAnswer extends LiveBaseMessage{
  constructor(client,sequence){
    super(client,"/service/controller",{
      id: 50,
      type: "message",
      gameid: client.gameid,
      host: "kahoot.it",
      content: JSON.stringify({
        sequence: sequence.join("")
      })
    });
  }
};
