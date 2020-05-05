const CONSTS = require("./consts.js");
const userAgents = require("user-agents");
const EventEmitter = require("events");

class ChallengeHandler extends EventEmitter {
	constructor(kahoot,content,proxy) {
		super();
		this.kahoot = kahoot;
		this.clientID = "_none_";
		this.name = "";
    this.challengeData = content;
    this.proxy = proxy;
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
