/**
 * @fileinfo This module exports a function used for delays
 * sleep - sleeps
 * @param {Number} n The number of seconds to wait
 * @returns {Promise} Resolves after n seconds
 */
module.exports = function sleep(n){
  return new Promise((resolve)=>{
    setTimeout(resolve,n*1000);
  });
};
