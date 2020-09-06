const LiveQuestionAnswer = require("../assets/LiveQuestionAnswer.js");
const sleep = require("../util/sleep.js");
/**
 * @fileinfo This is the answer module
 * - Loads the answer method
 */
module.exports = function(){

  /**
   * Answer a question
   * @function Client#answer
   *
   * @param {(Number|String|Number[])} choice The answer to the question
   * - defaults:
   * - 1 answer, number: 0
   * - multi answer: [0,1,2,3]
   * - "undefined"
   * @returns {Promise<LiveEventTimetrack>} Resolves when answer is received.
   */
  this.answer = async (choice)=>{
    let wait = Date.now() - this.questionStartTime;
    if(isNaN(wait)){
      wait = 0;
    }
    if(wait < 250){
      await sleep((250 - wait) / 1000);
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
