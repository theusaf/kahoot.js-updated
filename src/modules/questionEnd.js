/**
 * @fileinfo This is the questionEnd module
 * - Loads the QuestionEnd event
 */
module.exports = function(){

  /**
   * questionEnd - Handles the QuestionEnd event
   * @param {Object} message The websocket message
   */
  this.handlers.questionEnd = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 8){

      /**
       * An event emitted at the end of the question. Contains ranking information.
       *
       * @event Client#QuestionEnd
       * @type {Object}
       * @property {(Number|Number[]|String)} choice The answer from the client
       * @property {String} type The question type
       * @property {Boolean} isCorrect Whether the client answered the question correctly
       * @property {String} text The text content of answers sent by the client
       * @property {Number} receivedTime The time (ms) when the answer was received
       * @property {Booean} pointsQuestion Whether the question offered points
       * @property {Number} points The amount of points earned from the question
       * @property {Number[]} correctChoices A list of the indexes of correct choices (used in multi select quizzes)
       * @property {Number} totalScore The total score of the client
       * @property {Number} rank The current position of the client
       * @property {PointsData} pointsData Extra information about the points data
       * @property {Nemesis} nemesis The nemesis
       */
      this._emit("QuestionEnd",JSON.parse(message.data.content));
    }
  };
};

/**
 * Information about a player one rank above the client.
 * @namespace Nemesis
 * @type {Object}
 * @property {String} name The nemesis's name
 * @property {Boolean} isGhost Whether the nemesis is a ghost
 * @property {Number} totalScore The number of points the nemesis has
 */

/**
 * Information about the client's points.
 * @namespace PointsData
 * @type {Object}
 * @property {Number} questionPoints The number of points earned from the question
 * @property {Number} totalPointsWithBonuses The number of points earned (including bonuses)
 * @property {Number} totalPointsWithoutBonuses The number of points earned without bonuses
 * @property {StreakPoints} answerStreakPoints Information abuot answer streaks
 * @property {Number} lastGameBlockIndex The previous question index
 */

/**
 * Detailed information about the client's answer streaks
 * @namespace StreakPoints
 * @type {Object}
 * @property {Number} streakLevel How many questions were answered correctly in a row.
 * @property {Number} streakBonus Bonus points awarded by the streakLevel
 * @property {Number} totalStreakPoints The total streak points earned.
 * @property {Number} previousStreakLevel The previous steak level
 * @property {Number} previousStreakBonus The previous streak bonus
 */
