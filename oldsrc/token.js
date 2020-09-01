const https = require("https");
const http = require("http");
const path = require("path");
const consts = require(path.join(__dirname,"consts.js"));
const ua = require("user-agents");
const URL = require("url").URL;

class TokenJS {
	static requestToken(sessionID, callback, proxy) {
		// Make a GET request to the endpoint and get 2 tokens
		var proxyOptions;
		var nopath;
		if(typeof(proxy) == "string"){
			proxy = proxy || "";
		}else if(proxy && proxy.proxy){
			proxyOptions = proxy.options || {};
			nopath = proxy.nopath;
			proxy = proxy.proxy;
		}else{
			proxy = "";
		}
		var uri;
		if(nopath){ // don't append
			uri = new URL(proxy);
		}else{
			uri = new URL((proxy || "https://") + consts.ENDPOINT_URI + consts.TOKEN_ENDPOINT + sessionID + "/?" + Date.now());
		}
		let options = {
			port: consts.ENDPOINT_PORT,
			headers: {
				"user-agent": new ua().toString(),
				"host": (proxy && uri.hostname) || "kahoot.it",
				"referer": "https://kahoot.it/",
				"accept-language": "en-US,en;q=0.8",
				"accept": "*/*"
			}
		};
		if(proxyOptions){
			Object.assign(options,proxyOptions);
		}
		let proto;
		if(uri.protocol == "https:"){
			proto = https;
		}else{
			proto = http;
		}
		return proto.request(uri,options, res => {
			res.on("data", chunk => {
				// The first token is the session token, which is given as a header by the server encoded in base64
				// Checking if the header is defined before continuing, basically checking if the room exists.
				if (!res.headers["x-kahoot-session-token"]) {
					// console.log("request error:", "Kahoot Session Failure, this either means kahoot blocked this specific program or your gamepin is wrong.");
					return callback(null,null,null);
				}
				var token1 = res.headers["x-kahoot-session-token"];
				var body = chunk.toString("utf8");
				var bodyObject = null;
				var challenge = "";
				try {
					bodyObject = JSON.parse(body);
				} catch (e) {
					callback(null, e, null);
					return;
				}
				// The second token is given as a "challenge", which must be eval'd by the client to be decoded
				challenge = bodyObject.challenge;
				callback(token1, challenge, bodyObject);
			});
		}).on("error", err => {
			// TODO: better error handling
			// console.log("request error:", err);
			callback(null,err,null);
		}).end();
	}
	static solveChallenge(challenge) {
		var solved = "";
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
			// Concat the method needed in order to solve the challenge, then eval the string
			var solver = Function(consts.EVAL_ + challenge);
			// Execute the string, and get back the solved token
			solved = solver().toString();
		})();
		return solved;
	}
	static decodeBase64(b64) {
		// for the session token
		try {
			return new Buffer.from(b64, "base64").toString("ascii");
		} catch (e) {
			console.log("Error! (Most likely not a kahoot game, make sure your gamepin is right)");
		}
	}
	static concatTokens(headerToken, challengeToken) {
		// Combine the session token and the challenge token together to get the string needed to connect to the websocket endpoint
		for (var token = "", i = 0; i < headerToken.length; i++) {
			var char = headerToken.charCodeAt(i);
			var mod = challengeToken.charCodeAt(i % challengeToken.length);
			var decodedChar = char ^ mod;
			token += String.fromCharCode(decodedChar);
		}
		return token;
	}
	static resolve(sessionID, callback, proxy) {
		if(sessionID[0] == "0"){
			return this.requestChallenge(sessionID,callback,proxy);
		}
		this.requestToken(sessionID, (headerToken, challenge, gamemode) => {
			if(!headerToken){
				return callback(null,null);
			}
			var token1 = this.decodeBase64(headerToken);
			var token2 = this.solveChallenge(challenge);
			var resolvedToken = this.concatTokens(token1, token2);
			callback(resolvedToken, gamemode);
		}, proxy);
	}
	static requestChallenge(id,callback,proxy){
		// Make a GET request to the endpoint and get 2 tokens
		var proxyOptions;
		var nopath;
		if(typeof(proxy) == "string"){
			proxy = proxy || "";
		}else if(proxy && proxy.proxy){
			proxyOptions = proxy.options || {};
			nopath = proxy.nopath;
			proxy = proxy.proxy;
		}else{
			proxy = "";
		}
		var uri;
		if(nopath){ // don't append
			uri = new URL(proxy);
		}else{
			uri = new URL((proxy || "https://") + consts.ENDPOINT_URI + consts.CHALLENGE_ENDPOINT + "/pin/" + id);
		}
		let options = {
			port: consts.ENDPOINT_PORT,
			headers: {
				"user-agent": new ua().toString(),
				"host": (proxy && uri.hostname) || "kahoot.it",
				"referer": "https://kahoot.it/",
				"accept-language": "en-US,en;q=0.8",
				"accept": "*/*"
			}
		};
		if(proxyOptions){
			Object.assign(options,proxyOptions);
		}
		let proto;
		if(uri.protocol == "https:"){
			proto = https;
		}else{
			proto = http;
		}
		return proto.request(uri,options, res => {
			let chunks = [];
			res.on("data", chunk => {
				chunks.push(chunk);
			});
			res.on("end", ()=>{
				const body = Buffer.concat(chunks).toString("utf8");
				var bodyObject;
				try {
					bodyObject = JSON.parse(body);
				} catch (e) {
					callback(null, e, null);
					return;
				}
				try{
					callback(true,Object.assign({
						twoFactorAuth: false,
						gameMode: bodyObject.challenge.type,
						kahootData: bodyObject.kahoot,
						rawChallengeData: bodyObject.challenge
					},bodyObject.challenge.game_options));
				}catch(e){
					callback(null,e,null);
				}
			});
		}).on("error", err => {
			// TODO: better error handling
			console.log("request error:", err);
		}).end();
	}
}
module.exports = TokenJS;
