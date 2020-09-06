/**
 * @fileinfo This module exports a function used for delays
 */
module.exports = function sleep(n){
  return new Promise((resolve)=>{
    setTimeout(resolve,n*1000);
  });
};
