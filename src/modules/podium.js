/**
 * @fileinfo This is the podium module
 * - Loads the Podium event
 */
module.exports = function(){
  this.handlers.podium = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 13){

      /**
       * Emitted at the end of the game (After "QuizEnd")
       *
       * @event Client#Podium
       * @type {Object}
       * @property {String} podiumMedalType A string about the podium medal. "gold", "silver", "bronze" are possible values. May be nonexistent or null.
       */
      this._emit("Podium",JSON.parse(message.data.content));
    }
  };
};
