const LiveRequestData = require("../assets/LiveRequestData.js");
const sleep = require("../util/sleep.js");
module.exports = function(){

  /**
   * @function client.requestRecoveryData - Request recovery information from the server
   *
   * @returns {Promise} Resolves when request is sent and received.
   */
  this.requestRecoveryData = async()=>{
    await sleep(0.5);
    return new Promise((resolve)=>{
      this._send(new LiveRequestData(this),(r)=>{
        resolve();
      });
    });
  };
  this.handlers.recovery = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 17){
      const recover = JSON.parse(message.data.content);

      /**
       * Emitted when the server sends its recovery data.
       * This event is mostly for debugging.
       *
       * @event Client#RecoveryData
       * @see {@link https://kahoot.js.org/#/enum/LiveEventRecoveryData}
       */
      this.emit("RecoveryData",recover);
      const data = recover.data;
      switch (recover.defaultQuizData.state) {
      case 0:{
        if(!this.quiz){
          this.quiz = {
            get questionCount(){return (this.quizQuestionAnswers && this.quizQuestionAnswers.length) || 10;}
          };
        }
        this.quiz.quizQuestionAnswers = recover.defaultQuizData.quizQuestionAnswers;
        break;
      }
      case 1:{
        this._emit("QuizStart",data);
        break;
      }
      case 2:{
        this._emit("QuestionReady",data.getReady);
        break;
      }
      case 3:{
        this._emit("QuestionStart",data);
        break;
      }
      case 4:{
        this._emit("TimeUp",data);
        if(data.revealAnswer){
          this._emit("QuestionEnd",data.revealAnswer);
        }
        break;
      }
      case 6:{
        this._emit("QuizEnd",data);
        break;
      }
      case 7:{
        this._emit("Feedback");
        break;
      }
      }
    }
  };
  this.once("NameAccept",this.requestRecoveryData);
};
