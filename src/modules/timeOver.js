module.exports = function(){
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
