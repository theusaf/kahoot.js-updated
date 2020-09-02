module.exports = function(){
  this.handlers.questionEnd = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 1){

      /**
       * QuestionReady Event
       *
       * @event Client#QuestionReady Emitted when the question is about to start
       * @type {Object}
       * @property {Number}      
       */
      this._emit("QuestionReady",JSON.parse(message.data.content));
    }
  };
};
