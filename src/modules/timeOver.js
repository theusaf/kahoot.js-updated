/**
 * @fileinfo This is the timeOver module
 * - Loads the TimeOver event
 */
module.exports = function(){

  /**
   * timeOver - Handles the TimeOver event
   * @param {Object} message The websocket message
   */
  this.handlers.timeOver = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 4){

      /**
       * Emitted when time is over (before QuestionEnd)
       *
       * @event Client#TimeOver
       * @type {Object}
       * @property {Number} questionNumber The question index.
       */
      this._emit("TimeOver",JSON.parse(message.data.content));
    }
  };
};
