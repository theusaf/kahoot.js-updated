/**
 * @fileinfo This is the gameReset module
 * - Loads the GameReset event
 */
module.exports = function(){

  /**
   * gameReset - Handles the GameReset event
   * @param {Object} message The websocket message
   */
  this.handlers.gameReset = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 5){

      /**
       * Emitted when the host presses "play again" or continues to the next quiz in the list.
       *
       * @event Client#GameReset
       */
      this._emit("GameReset");
    }
  };
};
