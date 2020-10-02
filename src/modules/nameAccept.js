/**
 * @fileinfo This is the nameAccept module
 * - Loads the NameAccept event
 */
module.exports = function(){

  /**
   * nameAccept - Handles the NameAccept event
   * @param {Object} message The websocket message
   */
  this.handlers.nameAccept = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 14){
      const data = JSON.parse(message.data.content);
      this.name = data.playerName;

      /**
       * Emitted when the server has validated the client's name
       *
       * @event Client#NameAccept
       * @type {Object}
       * @property {String} playerName The player's name (may have changed from original value due to filter)
       * @property {String} quizType
       * @property {Boolean} playerV2
       */
      this.emit("NameAccept",data);
      delete this.handlers.nameAccept;
    }
  };
};
