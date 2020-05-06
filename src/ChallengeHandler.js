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
    const u = new userAgents();
    this.userAgent = u.toString();
    this.userAgentMeta = {
      width: u.screenWidth,
      height: u.screenHeight
    };
    this.receivedQuestionTime = 0;
    // to prevent certain things from crashing
    this.ws = {
      emit: ()=>{},
      on: ()=>{},
      once: ()=>{},
      send: ()=>{},
      close: ()=>{},
      terminate: ()=>{},
      readyState: 3,
      addEventListener: ()=>{}
    };
    getProgress().then(inf=>{
      this.challengeData.progress = inf;
			this.emit("ready");
    });

	}
  sendHttpRequest(url,opts,proxy,isJSON){
    var proxyOptions;
		var nopath;
		if(typeof(proxy) == "string"){
			proxy = proxy || "";
		}else if(proxy && proxy.proxy){
			proxyOptions = proxy.options || {};
			proxy = proxy.proxy;
			nopath = proxy.nopath;
		}else{
			proxy = "";
		}
		var uri;
		if(nopath){ // don't append
			uri = new URL(proxy);
		}else{
			uri = new URL((proxy || "") + url;
		}
		let options = {
			port: consts.ENDPOINT_PORT,
			headers: {
				"user-agent": this.userAgent,
				"host": (proxy && uri.hostname) || "kahoot.it",
				"referer": "https://kahoot.it/",
				"accept-language": "en-US,en;q=0.8",
				"accept": "*/*"
			}
		};
    if(opts){
      Object.assign(options,opts);
    }
		if(proxyOptions){
			Object.assign(options,proxyOptions);
		}
		let proto;
		if(uri.protocol == "https:"){
			proto = https;
		}else{
			proto = http;
		}
    return new Promise((resolve, reject)=>{
      proto.request(uri,options,res=>{
        res.on("data",data=>{
          const body = data.toString("utf8");
          if(isJSON){
            return resolve(JSON.parse(body));
          }
          resolve(body);
        });
      }).on("err",e=>{reject(e)}).end();
    });
  }
  login(name){
		return new Promise((resolve, reject)=>{
			this.name = String(name);
			this.sendHttpRequest(`https://${consts.ENDPOINT_URI}${consts.CHALLENGE_ENDPOINT}${this.challengeData.challenge.challengeId}/join/?nickname=${this.name}`,{method:"POST"},this.proxy,true).then(data=>{
				Object.assign(this.challengeData,data);
				resolve(this.challengeData);
				this.emit("joined");
			});
		});
  }
  // handles the logic of continuing to the next steps.
  next(){

  }
  calculateScore(){

  }
  getProgress(question){
    if(typeof question != "undefined"){
			return new Promise((resolve, reject)=>{
				this.sendHttpRequest(`https://${consts.ENDPOINT_URI}${consts.CHALLENGE_ENDPOINT}${this.challengeData.challenge.challengeId}progress/?upToQuestion=${question}`,null,thgis.proxy,true).then(data=>{
					resolve(data);
				});
			});;
    }else{ // first login. get data
			return new Promise((resolve, reject)=>{
				this.sendHttpRequest(`https://${consts.ENDPOINT_URI}${consts.CHALLENGE_ENDPOINT}${this.challengeData.challenge.challengeId}progress`,null,this.proxy,true).then(data=>{
					resolve(data);
				});
			});;
    }
  }
  leave(){
    return;
  }
  sendSubmit(choice,question){

  }
  send2Step(){
    return;
  }
  sendFeedback(){
    return;
  }
}
module.exports = ChallengeHandler;
