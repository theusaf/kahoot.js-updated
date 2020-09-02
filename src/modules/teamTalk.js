module.exports = function(){
  this.handlers.teamTalk = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 20){

      /**
       * TeamTalk Event - Emitted when team talk starts
       *
       * @event Client#TeamTalk
       * @type {Object}
       * @property {Number} questionIndex The current question index
       * @property {(Number|null)[]} quizQuestionAnswers A list about the number of choices per question.
       * @property {String} gameBlockType The question type
       * @property {String} gameBlockLayout The layout of the question
       * @property {Number} teamTalkDuration The number (in seconds) for team talk
       */
      this._emit("TeamTalk",JSON.parse(message.data.content));
    }
  };
};
