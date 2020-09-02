module.exports = function(){
  this.handlers.quizStart = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 9){

      /**
       * QuizStart Event
       *
       * @event Client#QuizStart Emitted at the start of the quiz
       * @type {Object}
       * @property {String} quizType
       * @property {Number[]} quizQuestionAnswers A list of numbers stating how many answers are in each question.      
       */
      this._emit("QuizStart",JSON.parse(message.data.content));
    }
  };
};
