const LiveBaseMessage = require("./LiveBaseMessage.js");
module.exports = class LiveQuestionAnswer extends LiveBaseMessage{
  constructor(client,choice){
    const question = (client.quiz && client.quiz.currentQuestion) || {};
    const type = question.gameBlockType || "quiz";
    let text = null;
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
          if(type === "jumble" && choice.length !== 4){
            choice = [0,1,2,3];
          }
        }
        break;
      case "word_cloud":
      case "open_ended":
        text = choice + "";
        break;
      default:
        if(isNaN(choice)){
          choice = 0;
        }
        choice = Number(choice);
    }
    const content = {
      gameid: client.gameid,
      host: "kahoot.it",
      id: 45,
      type: "message"
    };
    if(text){
      content.content = JSON.stringify({
        text,
        questionIndex: question.questionIndex || 0,
        meta: {
          lag: client._timesync.l || 30
        },
        type
      });
    }else{
      content.content = JSON.stringify({
        choice,
        questionIndex: question.questionIndex || 0,
        meta: {
          lag: client._timesync.l || 30
        },
        type
      });
    }
    super(client,"/service/controller",content);
  }
};
