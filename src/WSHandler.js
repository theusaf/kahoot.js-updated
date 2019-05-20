const EventEmitter = require("events");
var Promise = require("promise");
var WebSocket = require("ws");
var consts = require("./consts.js");

class WSHandler extends EventEmitter {
	constructor(session, token, kahoot) {
		super();
		var me = this;
		this.requires2Step = false;
		this.finished2Step = false;
		this.kahoot = kahoot;
		this.msgID = 0;
		this.clientID = "_none_";
		this.connected = false;
		this.gameID = session;
		this.name = "";
		this.firstQuizEvent = false;
		this.lastReceivedQ = null;
		this.ws = new WebSocket(consts.WSS_ENDPOINT + session + "/" + token, {
			origin: "https://kahoot.it/"
		});
		// Create anonymous callbacks to prevent an event emitter loop
		this.ws.on("open", () => {
			me.open();
		});
		this.ws.on("message", msg => {
			me.message(msg);
		});
		this.ws.on("close", () => {
			me.connected = false;
			me.close();
		});
		this.dataHandler = {
			1: (data, content) => {
				try{
					//if joining during the quiz
					if(!me.kahoot.quiz){
						me.emit("quizData",{name: "null", type: content.quizType, qCount: content.quizQuestionAnswers[0], totalQ: content.quizQuestionAnswers.length});
						return;
					}
					if (!me.kahoot.quiz.currentQuestion) {
						me.emit("quizUpdate", {
							questionIndex: content.questionIndex,
							timeLeft: content.timeLeft,
							type: content.gameBlockType,
							useStoryBlocks: content.canAccessStoryBlocks,
							ansMap: content.answerMap
						});
					} else if (content.questionIndex > me.kahoot.quiz.currentQuestion.index) {
						me.emit("quizUpdate", {
							questionIndex: content.questionIndex,
							timeLeft: content.timeLeft,
							type: content.gameBlockType,
							useStoryBlocks: content.canAccessStoryBlocks,
							ansMap: content.answerMap
						});
					}
				}catch(e){
					console.log("BEGIN_QUIZ_ERROR"); //You should never see this error...
				}
			},
			2: (data, content) => {
				me.emit("questionStart");
			},
			3: (data, content) => {
				me.emit("finish", {
					playerCount: content.playerCount,
					quizID: content.quizID,
					rank: content.rank,
					correct: content.correctCount,
					incorrect: content.incorrectCount
				});
			},
			7: (data, content) => {
				me.emit("questionSubmit", content.primaryMessage);
			},
			8: (data, content) => {
				// console.log(data);
				me.emit("questionEnd", {
					correctAnswers: content.correctAnswers,
					correct: content.isCorrect,
					points: content.points,
					pointsData: content.pointsData,
					rank: content.rank,
					nemesis: content.nemesis,
					hasNemesis: content.nemisisIsGhost,
					text: content.text,
					totalScore: content.totalScore
				});
			},
			9: (data, content) => {
				if (!me.firstQuizEvent) {
					me.firstQuizEvent = true;
					me.emit("quizData", {
						name: content.quizName,
						type: content.quizType,
						qCount: content.quizQuestionAnswers[0],
						totalQ: content.quizQuestionAnswers.length
					});
				}
			},
			10: (data, content) => {
				// The quiz has ended
				me.emit("quizEnd");
				try {
					me.ws.close();
				} catch (e) {
					// Most likely already closed
				}
			},
			13: (data, content) => {
				me.emit("finishText", {
					metal: content.podiumMedalType,
					msg1: content.primaryMessage,
					msg2: content.secondaryMessage
				});
			},
			12: (data, content)=>{
				me.emit("feedback");
			}
		}
	}
	getExt() {
		return {
			ack: true,
			timesync: {
				l: 0,
				o: 0,
				tc: (new Date).getTime()
			}
		}
	}
	getPacket(packet) {
		var l = ((new Date).getTime() - packet.ext.timesync.tc - packet.ext.timesync.p) / 2;
		var o = (packet.ext.timesync.ts - packet.ext.timesync.tc - l);
		var ack;
		var me = this;
		me.msgID++;
		return [{
			channel: packet.channel,
			clientId: me.clientID,
			ext: {
				ack: packet.ext.ack,
				timesync: {
					l: l,
					o: o,
					tc: (new Date).getTime()
				}
			},
			id: me.msgID + ""
		}]
	}
	getSubmitPacket(questionChoice) {
		var me = this;
		me.msgID++;
		return [{
			channel: "/service/controller",
			clientId: me.clientID,
			data: {
				content: JSON.stringify({
					choice: questionChoice,
					meta: {
						lag: 30,
						device: {
							userAgent: "kahoot.js",
							screen: {
								width: 1920,
								height: 1050
							}
						}
					}
				}),
				gameid: me.gameID,
				host: consts.ENDPOINT_URI,
				id: 45,
				type: "message"
			},
			id: me.msgID + ""
		}]
	}
	send(msg) {
		if (this.connected) {
			try {
				//console.log(JSON.stringify(msg));
				this.ws.send(JSON.stringify(msg));
			} catch(e) { }
		}
	}
	sendSubmit(questionChoice) {
		var packet = this.getSubmitPacket(questionChoice);
		this.send(packet);
	}
	open() {
		var me = this;
		this.connected = true;
		this.emit("open");
		var r = [{
			advice: {
				interval: 0,
				timeout: 60000
			},
			channel: consts.CHANNEL_HANDSHAKE,
			ext: {
				ack: true,
				timesync: {
					l: 0,
					o: 0,
					tc: (new Date).getTime()
				},
				id: "1",
				minimumVersion: "1.0",
				supportedConnectionTypes: [
					"websocket",
					"long-polling"
				],
				version: "1.0"
			}
		}];
		me.msgID++;
		me.send(r);
	}
	message(msg) {
		//console.log(msg);
		var me = this;
		var data = JSON.parse(msg)[0];
		if (data.channel == consts.CHANNEL_HANDSHAKE && data.clientId) { // The server sent a handshake packet
			this.clientID = data.clientId;
			var r = me.getPacket(data)[0];
			me.timesync = r.ext.timesync;
			r.ext.ack = undefined;
			r.channel = consts.CHANNEL_SUBSCR;
			r.clientId = me.clientID;
			r.subscription = "/service/controller";
			me.send(r);
			me.msgID++;
			r.subscription = "/service/player";
			r.id = me.msgID + "";
			me.send(r);
			me.msgID++;
			r.id = me.msgID + "";
			r.subscription = "/service/status";
			me.send(r);
			me.msgID++;
			//?
			var connectionPacket = me.getPacket(data)[0];
			connectionPacket.channel = consts.CHANNEL_CONN;
			connectionPacket.clientId = me.clientID;
			connectionPacket.connectionType = "websocket";
			connectionPacket.advice = {
				timeout: 0
			}
			me.send(connectionPacket);
		} else if(data.channel == consts.CHANNEL_CONN && data.advice && data.advice.reconnect && data.advice.reconnect == "retry"){
			//unsub
			var r = {
				ext:{
					timesync: me.timesync
				}
			};
			r.ext.ack = undefined;
			r.channel = consts.CHANNEL_UNSUBSCR;
			r.clientId = me.clientID;
			r.subscription = "/service/controller";
			r.id = me.msgID + "";
			me.send(r);
			me.msgID++;
			r.id = me.msgID + "";
			r.subscription = "/service/player";
			me.send(r);
			me.msgID++;
			r.id = me.msgID + "";
			r.subscription = "/service/status";
			me.send(r);
			me.msgID++;
			//resub
			var r = {
				ext: {
					timesync: me.timesync
				}
			};
			r.ext.ack = undefined;
			r.channel = consts.CHANNEL_SUBSCR;
			r.clientId = me.clientID;
			r.subscription = "/service/controller";
			r.id = me.msgID + "";
			me.send(r);
			me.msgID++;
			r.id = me.msgID + "";
			r.subscription = "/service/player";
			me.send(r);
			me.msgID++;
			r.id = me.msgID + "";
			r.subscription = "/service/status";
			me.send(r);
			me.msgID++;
			//connect packet
			var connectionPacket = {
				ext: {
					ack: 1,
					timesync: me.timesync
				},
				id: me.msgID + ""
			};
			connectionPacket.channel = consts.CHANNEL_CONN;
			connectionPacket.clientId = me.clientID;
			connectionPacket.connectionType = "websocket";
			me.send(connectionPacket);
			me.msgID++;
		}else if (data.channel == consts.CHANNEL_SUBSCR) {
			if (data.subscription == "/service/controller" && data.successful == true && !me.ready) {
				me.emit("ready");
				me.ready = true;
			}
		} else if (data.data) {
			if (data.data.error) {
				try{
					me.emit("error", data.data.error); //error here if stuff
				}catch(er){
					//error. usually due to username taken
				}
				return;
			} else if (data.data.type == "loginResponse") {
				// "/service/controller"
				me.emit("joined");
			} else {
				if (data.data.content) {
					var cont = JSON.parse(data.data.content);
					if (me.dataHandler[data.data.id]) {
						me.dataHandler[data.data.id](data, cont);
					} else {
						// console.log(data);
					}
				}
			}
		}
		if (data.ext && data.channel !== "/meta/unsubscribe" && data.channel !== "/meta/subscribe" && data.channel !== "/meta/handshake") {
			/*var m = me.getPacket(data);
			me.send(m);*/
			var packet = {
				ext: {
					ack: data.ext.ack,
					timesync: me.timesync
				},
				channel: data.channel,
				connectionType: "websocket",
				clientId: me.clientID,
				id: me.msgID + ""
			}
			me.msgID++;
			me.send(packet);
		}
		/*if(data.channel == "/service/player"){
			console.log(data.data);
		}*/
		if(!me.finished2Step && data.channel == "/service/player" && data.data ? (
			(
				data.data.id == 52 ? true:false
			)
		):(
			false
		)){
			me.finished2Step = true;
		}
		if(!me.finished2Step && data.channel == "/service/player" && data.data ? (
			(
				data.data.id == 53 ? true:false
			)
		):(
			false
		)){
			me.requires2Step = true;
			me.emit("2step");
		}
	}
	send2Step(steps){
		var me = this;
		var packet = [{
			channel: "/service/controller",
			clientId: me.clientID,
			data: {
				id: 50,
				type: "message",
				gameid: me.gameID,
				host: consts.ENDPOINT_URI,
				content: JSON.stringify({
					sequence: steps
				})
			},
			id: me.msgID + ""
		}];
		this.send(packet);
	}
	sendFeedback(fun,learning,recommend,overall){
		var me = this;
		var packet = [{
			channel: "/service/controller",
			clientId: me.clientID,
			data: {
				id: 11,
				type: "message",
				gameid: me.gameID,
				host: consts.ENDPOINT_URI,
				content: JSON.stringify({
					totalScore: me.kahoot.totalScore,
					fun: fun,
					learning: learning,
					recommend: recommend,
					overall: overall,
					nickname: me.kahoot.name
				})
			},
			id: me.msgID + ""
		}];
		this.send(packet);
	}
	login(name) {
		var me = this;
		me.name = name;
		var joinPacket = [{
			channel: "/service/controller",
			clientId: me.clientID,
			data: {
				gameid: me.gameID,
				host: consts.ENDPOINT_URI,
				name: name,
				type: "login"
			},
			id: me.msgID + ""
		}];
		me.msgID++;
		this.send(joinPacket);
	}
	close() {
		this.connected = false;
		this.emit("close");
	}
}
module.exports = WSHandler;
