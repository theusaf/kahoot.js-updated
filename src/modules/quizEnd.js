/**
 * @fileinfo This is the quizEnd module
 * - Loads the QuizEnd event
 */
module.exports = function(){

  /**
   * quizEnd - Handles the QuizEnd event
   * @param {Object} message The websocket message
   */
  this.handlers.quizEnd = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 3){

      /**
       * Emitted when the quiz ends.
       *
       * @event Client#QuizEnd
       * @type {Object}
       * @property {Number} rank The rank of the player
       * @property {String<Number>} cid The player id
       * @property {Number} correctCount The number of correct answers
       * @property {Number} incorrectCount The number of incorrect answers
       * @property {Boolean} isKicked Whether the player was kicked?
       * @property {Boolean} isGhost Whether the player is a ghost.
       * @property {Number} unansweredCount The number of unanswered questions.
       * @property {Number} playerCount The number of players in the game.
       * @property {Number} startTime The date (ms) when the quiz started.
       * @property {String} quizId The quiz uuid
       * @property {String} name The name of the player
       * @property {Number} totalScore The final score of the player.
       * @property {String} hostId
       * @property {null} challengeId
       * @property {Boolean} isOnlyNonPointGameBlockKahoot Whether the kahoot is only non-point questions?
       */
      this._emit("QuizEnd",JSON.parse(message.data.content));
    }
  };
};
