var https = require("https");
var consts = require("./consts");

class TokenJS {
	static requestToken(sessionID, callback) {
		// Make a GET request to the endpoint and get 2 tokens
		return https.get({
			host: consts.ENDPOINT_URI,
			path: consts.TOKEN_ENDPOINT + sessionID + "/?" + (new Date).getTime(),
			port: consts.ENDPOINT_PORT,
			headers: {
				"user-agent": "kahoot.js",
				"host": "kahoot.it",
				"referer": "https://kahoot.it/",
				"accept-language": "en-US,en;q=0.8",
				"accept": "*/*"
			}
		}, res => {
			res.on("data", chunk => {
				// The first token is the session token, which is given as a header by the server encoded in base64
				// Checking if the header is defined before continuing, basically checking if the room exists.
				if (!res.headers["x-kahoot-session-token"]) {
					return console.log("request error:", "Kahoot session header is undefined. (This normally means that the room no longer exists.)")
				}
				var token1 = res.headers["x-kahoot-session-token"];
				var body = chunk.toString("utf8");
				var bodyObject = null;
				var challenge = "";
				try {
					bodyObject = JSON.parse(body);
				} catch (e) {
					callback(null, e);
					return;
				}
				// The second token is given as a "challenge", which must be eval'd by the client to be decoded
				var challenge = bodyObject.challenge;
				callback(token1, challenge);
			});
		}).on("error", err => {
			// TODO: better error handling
			console.log("request error:", err);
		});
	}
	static solveChallenge(challenge) {
		var solved = "";
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
		try{
			return new Buffer(b64, "base64").toString("ascii");
		}catch(e){
			console.log("Error! (Most likely not a kahoot game)");
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
	static resolve(sessionID, callback) {
		var me = this;
		me.requestToken(sessionID, (headerToken, challenge) => {
			var token1 = this.decodeBase64(headerToken);
			var token2 = this.solveChallenge(challenge);
			var resolvedToken = this.concatTokens(token1, token2);
			callback(resolvedToken);
		});
	}
}
module.exports = TokenJS;
