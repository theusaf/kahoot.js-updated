module.exports = function(){
  this.handlers.timeOver = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 4){

      /**
       * TimeOver event
       *
       * @event Client#TimeOver Emitted when time is over (before QuestionEnd)
       * @type {Object}
       * @property {Number} questionNumber The question index.      
       */
      this._emit("TimeOver",JSON.parse(message.data.content));
    }
  };
};
