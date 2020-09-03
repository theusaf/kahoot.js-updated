/**
 * @fileinfo This module adds extra data to be stored by the client in various events
 */
module.exports = function(){
  const self = this;
  this.data.totalScore = 0;
  this.data.streak = 0;
  this.data.rank = 1;
  this.on("QuestionStart",(event)=>{
    Object.assign(event,{
      get answer(){
        return self.answer;
      },
      get type(){
        return event.type;
      }
    });
  });
  this.on("QuizStart",(event)=>{
    Object.assign(event,{
      get questionCount(){
        return event.quizQuestionAnswers.length;
      }
    });
  });
  this.on("QuestionStart",(event)=>{
    Object.assign(event,{
      get type(){
        return event.gameBlockType;
      }
    });
  });
  this.on("QuestionReady",(event)=>{
    Object.assign(event,{
      get type(){
        return event.gameBlockType;
      }
    });
  });
  this.on("QuestionEnd",(event)=>{
    this.data.totalScore = event.totalScore;
    this.data.streak = event.pointsData.streakLevel;
    this.data.rank = event.rank;
  });
};
