/**
 * @fileinfo This is the teamAccept module
 * - Loads the TeamAccept event
 */
module.exports = function(){

  /**
   * teamAccept - handles the TeamAccept event
   * @param {Object} message The websocket message
   */
  this.handlers.teamAccept = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 19){
      const data = JSON.parse(message.data.content);

      /**
       * Emitted when the team members were accepted.
       *
       * @event Client#TeamAccept
       * @type {Object}
       * @property {String[]} memberNames The team members names.
       * @property {RecoveryData} recoveryData The recovery data (contains the current event)
       */
      this.emit("TeamAccept",data);
      delete this.handlers.teamAccept;
      if(this.handlers.recovery){
        this.handlers.recovery({
          channel: "/service/player",
          data: {
            id: 17,
            content: JSON.stringify(data.recoveryData)
          }
        });
      }
    }
  };
};
