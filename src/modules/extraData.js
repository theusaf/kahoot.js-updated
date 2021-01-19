/**
 * @fileinfo This module adds extra data to be stored by the client in various events
 */

/**
 * Extra client data.<br/>
 * Note: Some properties listed may not exist if the extraData module is disabled.
 * @namespace Client#data
 * @type {Object}
 * @property {Number} totalScore The total score of the client
 * @property {Number} streak The answer streak of the client
 * @property {Number} rank The position of the client.
 */
module.exports = function(){
  const self = this;
  this.data.totalScore = 0;
  this.data.streak = 0;
  this.data.rank = 1;
  this.on("GameReset",()=>{
    this.data.totalScore = 0;
    this.data.rank = 0;
    this.data.streak = 0;
    delete this.quiz;
  });
  this.on("QuestionStart",(event)=>{
    Object.assign(event,{
      get answer(){
        return self.answer;
      },
      get type(){
        return event.type;
      },
      get index(){
        return event.questionIndex;
      }
    });
    try{
      Object.assign(self.quiz.currentQuestion,event);
    }catch(e){}
  });
  this.on("QuizStart",(event)=>{
    Object.assign(event,{
      get questionCount(){
        return event.quizQuestionAnswers.length;
      }
    });
    try{
      Object.assign(self.quiz,event);
    }catch(e){}
  });
  this.on("QuestionReady",(event)=>{
    Object.assign(event,{
      get type(){
        return event.gameBlockType;
      },
      get index(){
        return event.questionIndex;
      }
    });
    try{
      Object.assign(self.quiz.currentQuestion,event);
    }catch(e){}
  });
  this.on("QuestionEnd",(event)=>{
    if(event.hasAnswer === false){
      return;
    }
    this.data.totalScore = event.totalScore;
    this.data.streak = event.pointsData.answerStreakPoints.streakLevel;
    this.data.rank = event.rank;
  });
};

/**
 * The quiz object. May contain other information. See QuizStart event.
 * @namespace Client#quiz
 * @type {Object}
 * @property {Number[]} quizQuestionAnswers The list of numbers signifying the number of choices/question.
 * @property {Number} questionCount The number of questions.
 * @property {Client#quiz.currentQuestion}
 */

/**
 * The question object. May contain other information than listed below. See question events.
 * @namespace Client#quiz.currentQuestion
 * @type {Object}
 * @property {Number} questionIndex The current question index
 * @property {Number} index Alias for questionIndex
 * @property {String} gameBlockType The question type.
 * @property {String} type Alias for gameBlockType
 * @property {Function} answer Alias for {@link Client#answer}. Only exists on QuestionStart.
 */
