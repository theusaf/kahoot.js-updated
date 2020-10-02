/**
 * @fileinfo This is the quizStart module
 * - Loads the QuizStart event
 */
module.exports = function(){

  /**
   * questionStart - handles QuestionStart events
   * @param {Object} message The websocket message  
   */
  this.handlers.questionStart = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 2){

      /**
       * Emitted when the question starts
       *
       * @event Client#QuestionStart
       * @type {Object}
       * @property {Number} questionIndex The question index
       * @property {String} gameBlockType The question type
       * @property {String} gameBlockLayout The layout of the question. May be nonexistent
       * @property {Number[]} quizQuestionAnswers An array of numbers, signifying the number of answer choices in each question
       * @property {Number} timeAvailable The time available in the question.
       */
      this.questionStartTime = Date.now();
      this._emit("QuestionStart",JSON.parse(message.data.content));
    }
  };
};
