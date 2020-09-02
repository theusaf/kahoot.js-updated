const EventEmitter = require("events");
const {URL} = require("url");
const http = require("http");
const https = require("https");

// overwrites functions
function Injector(){
  this.data = this.data || {};
  Object.assign(this.data,{
    score: 0,
    streak: 0,
    phase: "start"
  });

  this.answer = ()=>{

  };

  this.next = ()=>{

  };

  this.leave = ()=>{
    this.stop = true;
  };

  const joined = (cid)=>{
    this.socket.emit("message",JSON.stringify([{
      channel: "/service/controller",
      data: {
        type: "loginResponse",
        cid: cid+""
      }
    }]));
    this._send = async ()=>{throw "This error should not appear unless you are trying to do something silly.";};
  };

  this._send = async (m)=>{
    if(m.data && m.data.type === "login"){
      this.name = m.data.name + "";
      let count = 0;
      for(let p of this.challengeData.progress.playerProgress.playerProgressEntries){
        if(!p.questionMetrics){
          break;
        }
        if(this.name in p.questionMetrics){
          if(this.challengeData.progress.summary.playersUnfinished && this.challengeData.progress.summary.playersUnfinished.filter(o=>{
						return o.playerId === this.name;
					}).length){
            const pl = this.challengeData.progress.summary.playersUnfinished.filter(o=>{
							return o.playerId == this.name;
						})[0];
            this.score = pl.finalScore;
						this.questionIndex = pl.totalAnswerCount; // should load the next question probably
						count = pl.totalAnswerCount;
          }else{
						joined(0);
						setTimeout(()=>{
              this.disconnectReason = "Session Ended";
							this.socket.emit("close");
						},2000);
						return this.challengeData;
          }
        }else{
          break;
        }
      }
      if(count > 0){
        for(let u of this.challengeData.challenge.challengeUsersList){
          if(u.nickname === this.name){
            this.cid = u.playerCId;
            break;
          }
        }
        joined(cid);
        if(this.defaults.options.ChallengeAutoContinue){
					setTimeout(()=>{this.next();},5000);
				}
        return this.challengeData;
      }
    }
  };

  this._httpRequest(url,opts,json,packet) = ()=>{
    return new Promise((resolve, reject)=>{
      function handleRequest(res){
        const chunks = [];
        res.on("data",(chunk)=>{
          chunks.push(chunk);
        });
        res.on("end",()=>{
          const data = Buffer.concat(chunks).toString("utf8");
          if(json){
            resolve(JSON.parse(data));
          }
        });
      }
      const parsed = new URL(url);
      let options = {
        headers: {
          "User-Agent": this.userAgent,
          "Host": "kahoot.it",
          "Referer": "https://kahoot.it/",
          "Accept-Language": "en-US,en;q=0.8",
          "Accept": "*/*"
        },
        host: parsed.hostname,
        protocol: parsed.protocol,
        path: parsed.pathname
      }
      Object.assign(options,opts);
      const proxyOptions = this.defaults.proxy(options);
      options = proxyOptions || options;
      let req;
      if(options.protocol === "https:"){
        https.request(options,handleRequest);
      }else{
        http.request(options,handleRequest);
      }
      req.on("error",(e)=>{reject(e)});
      req.end(packet);
    });
  };

  this._getProgress = (q)=>{
    if(q){
      return this._httpRequest(`https://kahoot.it/rest/challenges/${this.challengeData.challenge.challengeId}/progress/?upToQuestion=${question}`,null,true);
    }else{
      return this._httpRequest(`https://kahoot.it/rest/challenges/pin/${this.gameid}`,null,true).then((data)=>{
        return this._httpRequest(`https://kahoot.it/rest/challenges/${data.challenge.challengeId}/progress`,null,true).then((progress)=>{
          return Object.assign(data,{progress});
        });
      });
    }
  };

  this._getProgress().then(inf=>{
    if(Object.keys(inf.progress).length == 0){
      this.disconnectReason = "Invalid Challenge";
			return this.socket.emit("close");
		}
    this.challengeData = inf;
    if(inf.challenge.endTime <= Date.now() || inf.challenge.challengeUsersList.length >= inf.challenge.maxPlayers){
      this.disconnectReason = "Challenge Ended/Full"
      return this.socket.emit("close");
    }else{
      this.socket.emit("HandshakeComplete");
    }
  });
}

// pretends to be a websocket
class ChallengeHandler extends EventEmitter{
  constructor(client,content){
    super();
    client.challengeData = content;
    Injector.call(client,this);
    this.readyState = 3;
    this.close = ()=>{};
  }
}

 module.exports = ChallengeHandler;
