const LiveBaseMessage = require("./LiveBaseMessage.js");
module.exports = class LiveJoinTeamPacket extends LiveBaseMessage{
  constructor(client,team){
    super(client,"/service/controller",{
      gameid: client.gameid,
      host: "kahoot.it",
      content: JSON.stringify(team),
      id: 18,
      type: "message"
    });
  }
};
