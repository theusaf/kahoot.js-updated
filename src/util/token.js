const https = require("https");
const http = require("http");
const ua = require("user-agents");

class Decoder{
  static requestChallenge(pin,client){
    return new Promise((resolve, reject)=>{
      function handleRequest(res){
        const chunks = [];
        res.on("data",(chunk)=>{
          chunks.push(chunk);
        });
        res.on("end",()=>{
          const body = Buffer.concat(chunks).toString("utf8");
          let bodyObject;
          try{
            bodyObject = JSON.parse(body);
            resolve({
              data: Object.assign({
                isChallenge: true,
                twoFactorAuth: false,
                kahootData: bodyObject.kahoot,
                rawChallengeData: bodyObject.challenge
              },bodyObject.challenge.game_options)
            });
          }catch(e){
            return reject(e);
          }
        });
      }
      let options = {
        headers: {
          "User-Agent": (new ua).toString(),
          "Origin": "kahoot.it",
          "Referer": "https://kahoot.it/",
          "Accept-Language": "en-US,en;q=0.8",
          "Accept": "*/*"
        },
        host: "kahoot.it",
        protocol: "https:",
        path: `/rest/challenges/pin/${pin}`
      };
      const proxyOptions = client.defaults.proxy(options);
      options = proxyOptions || options;
      let req;
      if(options.protocol === "https:"){
        req = https.request(options,handleRequest);
      }else{
        req = http.request(options,handleRequest);
      }
      req.on("error",(e)=>{
        reject(e);
      });
      req.end();
    });
  }
  static requestToken(pin,client){
    return new Promise((resolve,rej)=>{
      function handleRequest(res){
        const chunks = [];
        res.on("data",(chunk)=>{
          chunks.push(chunk);
        });
        res.on("end",()=>{
          let token = res.headers["x-kahoot-session-token"];
          if(!token){
            rej("header_token");
          }
          try{
            token = Buffer.from(token,"base64").toString("ascii");
            const data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
            resolve({
              token,
              data
            });
          }catch(e){
            rej(e);
          }
        });
      }
      let options = {
        headers: {
          "User-Agent": (new ua).toString(),
          "Origin": "kahoot.it",
          "Referer": "https://kahoot.it/",
          "Accept-Language": "en-US,en;q=0.8",
          "Accept": "*/*"
        },
        host: "kahoot.it",
        path: `/reserve/session/${pin}/?${Date.now()}`,
        protocol: "https:"
      };
      const proxyOptions = client.defaults.proxy(options);
      options = proxyOptions || options;
      let req;
      if(options.protocol === "https:"){
        req = https.request(options,handleRequest);
      }else{
        req = http.request(options,handleRequest);
      }
      req.on("error",(e)=>{
        rej(e);
      });
      req.end();
    });
  }
  static solveChallenge(challenge){
    let solved = "";
    challenge = challenge.replace(/(\u0009|\u2003)/mg, "");
    challenge = challenge.replace(/this /mg, "this");
    challenge = challenge.replace(/ *\. */mg, ".");
    challenge = challenge.replace(/ *\( */mg, "(");
    challenge = challenge.replace(/ *\) */mg, ")");
    // Prevent any logging from the challenge, by default it logs some debug info
    challenge = challenge.replace("console.", "");
    // Make a few if-statements always return true as the functions are currently missing
    challenge = challenge.replace("this.angular.isObject(offset)", "true");
    challenge = challenge.replace("this.angular.isString(offset)", "true");
    challenge = challenge.replace("this.angular.isDate(offset)", "true");
    challenge = challenge.replace("this.angular.isArray(offset)", "true");
    (() => {
      const EVAL_ = `var _ = {
        replace: function() {
          var args = arguments;
          var str = arguments[0];
          return str.replace(args[1], args[2]);
        }
      };
      var log = function(){};return `;
      // Concat the method needed in order to solve the challenge, then eval the string
      const solver = Function(EVAL_ + challenge);
      // Execute the string, and get back the solved token
      solved = solver().toString();
    })();
    return solved;
  }
  static concatTokens(headerToken, challengeToken) {
    // Combine the session token and the challenge token together to get the string needed to connect to the websocket endpoint
    for (var token = "", i = 0; i < headerToken.length; i++) {
      let char = headerToken.charCodeAt(i);
      let mod = challengeToken.charCodeAt(i % challengeToken.length);
      let decodedChar = char ^ mod;
      token += String.fromCharCode(decodedChar);
    }
    return token;
  }
  static resolve(pin,client){
    if(isNaN(pin)){
      return new Promise((res,reject)=>{reject("Invalid/Missing PIN");});
    }
    if(pin[0] === "0"){
      // challenges
      return this.requestChallenge(pin,client);
    }
    return this.requestToken(pin,client).then(data=>{
      const token2 = this.solveChallenge(data.data.challenge);
      const token = this.concatTokens(data.token,token2);
      return {
        token,
        data: data.data
      };
    });
  }
}

module.exports = Decoder;
