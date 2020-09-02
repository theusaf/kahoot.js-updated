const LiveQuestionAnswer = require("../assets/LiveQuestionAnswer.js");
const sleep = require("../util/sleep.js");
module.exports = function(){

  /**
   * answer - Answer a question
   *
   * @param {(Number|String|Number[])} choice The answer to the question
   * - defaults:
   * - 1 answer, number: 0
   * - multi answer: [0,1,2,3]
   * - "undefined"
   * @returns {Promise<LiveEventTimetrack>} Resolves when answer is received.
   */
  this.answer = async (choice)=>{
    const wait = Date.now() - this.questionStartTime;
    if(wait < 250){
      await sleep(wait - 250);
    }
    return new Promise((resolve, reject)=>{
      this._send(new LiveQuestionAnswer(this,choice),(result)=>{
        if(!result || !result.successful){
          reject(result);
        }else{
          resolve(result);
        }
      });
    });
  };
};
