const got = require("got"),
  ua = require("random-useragent"),
  sleep = require("./sleep.js");

class Decoder{

  /**
   * @static requestChallenge - Requests information about Kahoot! challenges.
   *
   * @param  {String<Number>} pin The gameid of the challenge the client is trying to connect to
   * @param  {Client} client The client
   * @returns {Promise<Object>} The challenge data
   */
  static async requestChallenge(pin,client){
    let tries = 0;
    async function handleRequest(){
      let options = {
        headers: {
          "User-Agent": ua.getRandom(),
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
      const request = got(options);
      client.emit("_Request", request);
      try{
        const data = await request.json();
        return {
          data: Object.assign({
            isChallenge: true,
            twoFactorAuth: false,
            kahootData: data.kahoot,
            rawChallengeData: data.challenge
          },data.challenge.game_options)
        };
      }catch(e){
        if(tries < 2){
          tries++;
          await sleep(2);
          return await handleRequest();
        }
        throw {
          description: "Failed to get challenge data",
          error: e
        };
      }
    }
    return await handleRequest();
  }

  /**
   * @static requestToken - Requests the token for live games.
   *
   * @param  {String<Number>} pin The gameid
   * @param  {Client} client The client
   * @returns {Promise<object>} The game options
   */
  static async requestToken(pin,client){
    let tries = 0;
    async function handleRequest(){
      let options = {
        headers: {
          "User-Agent": ua.getRandom(),
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
      const request = got(options);
      client.emit("_Request", request);
      try{
        const {headers,body} = await request,
          data = JSON.parse(body);
        if(!headers["x-kahoot-session-token"]){
          throw {
            description: "Missing header token (pin doesn't exist)"
          };
        }
        return {
          token: Buffer.from(headers["x-kahoot-session-token"],"base64").toString("utf8"),
          data
        };
      }catch(e){
        tries ++;
        if(tries < 3){
          await sleep(2);
          return await handleRequest();
        }
        throw e.description ? e : {
          description: "Request failed or timed out.",
          error: e
        };
      }
    }
    return await handleRequest();
  }

  /**
   * @static solveChallenge - Solves the challenge for the various Kahoot! tokens.
   *
   * @param  {String} challenge The JS function to execute to get the challenge token.
   * @returns {String} The decoded token
   */
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

  /**
   * @static concatTokens - Combines the two tokens to get the final token
   *
   * @param  {String} headerToken The base64 decoded header token
   * @param  {String} challengeToken The decoded challenge token
   * @returns {String} The final token
   */
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

  /**
   * @static resolve - The main function for getting token info
   *
   * @param  {String<Number>} pin The gameid
   * @param  {Client} client The client
   * @returns {Promise<Object>} The game information.
   */
  static resolve(pin,client){
    if(isNaN(pin)){
      return new Promise((res,reject)=>{
        reject({
          description: "Invalid/Missing PIN"
        });
      });
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

/**
 * @fileinfo This module contains functions for fetching important tokens used for connection
 */
module.exports = Decoder;
