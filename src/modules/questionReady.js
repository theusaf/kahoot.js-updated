/**
 * @fileinfo This is the questionReady module
 * - Loads the QuestionReady event
 */
module.exports = function(){

  /**
   * QuestionReady - Handles the QuestionReady event
   * @param {Object} message The websocket message
   */
  this.handlers.QuestionReady = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 1){

      /**
       * Emitted when the question is about to start
       *
       * @event Client#QuestionReady
       * @type {Object}
       * @property {Number} questionIndex The question index
       * @property {String} gameBlockType The question type
       * @property {String} gameBlockLayout The question layout
       * @property {Number[]} quizQuestionAnswers An array of numbers, signifying the number of answer choices in each question
       * @property {Number} timeLeft The time in seconds before the quiz starts
       */
      this._emit("QuestionReady",JSON.parse(message.data.content));
    }
  };
};
