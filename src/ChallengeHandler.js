const CONSTS = require("./consts.js");
const userAgents = require("user-agents");
const EventEmitter = require("events");
const Promise = require("promise");

class ChallengeHandler extends EventEmitter {
	constructor(kahoot,content,proxy) {
		super();
		this.kahoot = kahoot;
		this.clientID = "_none_";
		this.name = "";
    this.challengeData = content;
    this.proxy = proxy;
	}
  sendHttpRequest(url,options,proxy){

  }
  // handles the logic of continuing to the next steps.
  next(){

  }
  getProgress(){

  }
  leave(){
    return;
  }
  sendSubmit(){

  }
  send2Step(){
    return;
  }
  sendFeedback(){
    return;
  }
}
module.exports = ChallengeHandler;
