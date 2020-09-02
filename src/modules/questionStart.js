module.exports = function(){
  this.handlers.questionStart = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 2){

      /**
       * QuestionStart Event
       *
       * @event Client#QuestionStart Emitted when the question starts
       * @type {Object}
       * @property {Number} questionIndex The question index
       * @property {String} gameBlockType The question type
       * @property {String} gameBlockLayout The layout of the question. May be nonexistent
       * @property {Number[]} quizQuestionAnswers An array of numbers, signifying the number of answer choices in each question
       * @property {Number} timeAvailable The time available in the question.      
       */
      this._emit("QuestionStart",JSON.parse(message.data.content));
    }
  };
};
