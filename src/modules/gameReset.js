module.exports = function(){
  this.handlers.gameReset = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 5){

      /**
       * GameReset Event
       *
       * @event Client#GameReset Emitted when the host presses "play again" or continues to the next quiz in the list.
       */
      this._emit("GameReset");
    }
  };
};
