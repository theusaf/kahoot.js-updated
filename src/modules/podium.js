module.exports = function(){
  this.handlers.podium = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 13){

      /**
       * Podium event
       *
       * @event Client#Podium Emitted at the end of the game (After "QuizEnd")
       * @type {Object}
       * @property {String} podiumMedalType A string about the podium medal. "gold", "silver", "bronze" are possible values. May be nonexistent or null.
       */
      this._emit("Podium",JSON.parse(message.data.content));
    }
  };
};
