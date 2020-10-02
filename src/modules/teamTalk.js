/**
 * @fileinfo This is the teamTalk module
 * - Loads the TeamTalk event
 */
module.exports = function(){

  /**
   * teamTalk - Handles the TeamTalk event
   * @param {Object} message The websocket message
   */
  this.handlers.teamTalk = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 20){

      /**
       * Emitted when team talk starts
       *
       * @event Client#TeamTalk
       * @type {Object}
       * @property {Number} questionIndex The current question index
       * @property {Number[]} quizQuestionAnswers A list about the number of choices per question.
       * @property {String} gameBlockType The question type
       * @property {String} gameBlockLayout The layout of the question
       * @property {Number} teamTalkDuration The number (in seconds) for team talk
       */
      this._emit("TeamTalk",JSON.parse(message.data.content));
    }
  };
};
