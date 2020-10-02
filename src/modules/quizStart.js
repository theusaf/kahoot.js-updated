/**
 * @fileinfo This is the quizStart module
 * - Loads the QuizStart event
 */
module.exports = function(){

  /**
   * quizStart - handles the quizStart event
   * @param {Object} message The websocket message
   */
  this.handlers.quizStart = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 9){

      /**
       * Emitted at the start of the quiz
       *
       * @event Client#QuizStart
       * @type {Object}
       * @property {String} quizType
       * @property {Number[]} quizQuestionAnswers A list of numbers stating how many answers are in each question.
       */
      this._emit("QuizStart",JSON.parse(message.data.content));
    }
  };
};
