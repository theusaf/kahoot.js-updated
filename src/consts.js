module.exports = {
	ENDPOINT_URI: "kahoot.it",
	ENDPOINT_PORT: 443,
	TOKEN_ENDPOINT: "/reserve/session/",
	EVAL_: "var _ = {" +
			"	replace: function() {" +
			"		var args = arguments;" +
			"		var str = arguments[0];" +
			"		return str.replace(args[1], args[2]);" +
			"	}" +
			"}; " +
			"var log = function(){};" +
			"return ",
	WSS_ENDPOINT: "wss://kahoot.it/cometd/",
	CHANNEL_HANDSHAKE: "/meta/handshake",
	CHANNEL_SUBSCR: "/meta/subscribe",
	CHANNEL_CONN: "/meta/connect",
	SUPPORTED_CONNTYPES: [
		"websocket",
		"long-polling"
	]
}
