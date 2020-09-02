const LiveBaseMessage = require("./LiveBaseMessage.js");
module.exports = class LiveQuestionAnswer extends LiveBaseMessage{
  constructor(client,choice){
    const question = (client.quiz && client.quiz.currentQuestion) || {};
    const type = question.gameBlockType || "quiz";
    switch (type) {
      case "multiple_select_quiz":
      case "multiple_select_poll":
      case "jumble":
        if(typeof choice.length === "undefined" || typeof choice.push === "undefined"){
          // not an array.
          if(isNaN(choice)){
            choice = [0,1,2,3];
          }else{
            choice = [+choice];
          }
        }
        break;
      case "word_cloud":
      case "open_ended":
        choice = choice + "";
        break;
      default:
        if(isNaN(choice)){
          choice = 0;
        }
        choice = Number(choice);
    }
    super(client,"/service/controller",{
      content: JSON.stringify({
        choice,
        questionIndex: question.questionIndex || 0,
        meta: {
          lag: client._timesync.l || 30
        },
        type
      }).
      gameid: client.gameid,
      host: "kahoot.it",
      id: 45,
      type: "message"
    });
  }
}
