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
						me.emit("quizData",{name: "null", type: content.quizType, qCount: content.quizQuestionAnswers[0], totalQ: content.quizQuestionAnswers.length, quizQuestionAnswers: content.quizQuestionAnswers});
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
					quizID: content.quizId,
					rank: content.rank,
					correct: content.correctCount,
					incorrect: content.incorrectCount
				});
			},
			7: (data, content) => { // Appears to be removed in V2
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
						totalQ: content.quizQuestionAnswers.length,
						questionAnswers: content.quizQuestionAnswers
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
		var me = this;
		var l,o;
		try{
			l = Math.round(((new Date).getTime() - packet.ext.timesync.tc - packet.ext.timesync.p) / 2);
			o = (packet.ext.timesync.ts - packet.ext.timesync.tc - l);
			me.timesync = {
				tc: (new Date).getTime(),
				l: l,
				o: o
			};
		}catch(err){
			me.timesync = {
				tc: (new Date).getTime(),
				l: 0,
				o: 0
			}
		}
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
		}];
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
					questionIndex: me.kahoot.quiz.currentQuestion.index,
					meta: {
						lag: 30
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
		return new Promise((res,rej)=>{
			if (this.connected) {
				try {
					//console.log("U " + JSON.stringify(msg));
					this.ws.send(JSON.stringify(msg),res);
				} catch(e) { }
			}
		});
	}
	sendSubmit(questionChoice) {
		var me = this;
		var packet = this.getSubmitPacket(questionChoice);
		this.send(packet).then(()=>{
			const snark = ["Toooo fast?","Genius machine?","Pure luck or true genius?"];
			me.emit("questionSubmit",snark[Math.floor(Math.random()*snark.length)]);
		});
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
		//console.log("D " + msg);
		var me = this;
		var data = JSON.parse(msg)[0];
		if (data.channel == consts.CHANNEL_HANDSHAKE && data.clientId) { // The server sent a handshake packet
			this.clientID = data.clientId;
			var r = me.getPacket(data)[0];
			r.advice = {timeout: 0};
			r.channel = "/meta/connect";
			r.connectionType = "websocket";
			r.ext.ack = 0;
			me.send([r]);
		} else if(data.channel == consts.CHANNEL_CONN && data.advice && data.advice.reconnect && data.advice.reconnect == "retry"){
			//connect packet
			var connectionPacket = {
				ext: {
					ack: 1,
					timesync: me.timesync
				},
				id: ++me.msgID + ""
			};
			connectionPacket.channel = consts.CHANNEL_CONN;
			connectionPacket.clientId = me.clientID;
			connectionPacket.connectionType = "websocket";
			me.send(connectionPacket);
			me.emit("ready");
			me.ready = true;
		}else if (data.channel == consts.CHANNEL_SUBSCR) {
			if (data.subscription == "/service/controller" && data.successful == true && !me.ready) {
				me.emit("ready");
				me.ready = true;
			}
		} else if (data.data) {
			if (data.data.error) {
				if(data.data.type && data.data.type == "loginResponse"){
					return me.emit("invalidName");
				}
				try{
					me.emit("error", data.data.error); //error here if stuff
				}catch(er){
					//error. usually due to username taken
				}
				return;
			} else if (data.data.type == "loginResponse") {
				// "/service/controller"
				me.kahoot.cid = data.data.cid;
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
		if (data.ext && data.channel == "/meta/connect" && me.ready) {
			var packet = me.getPacket(data)[0];
			packet.connectionType = "websocket";
			me.send([packet]);
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
	relog(cid){
		var me = this;
		if(!me.ready){
			setTimeout(()=>{me.relog(cid);},500);
			return;
		}
		me.msgID++;
		let packet = {
			channel: "/service/controller",
			clientId: me.clientID,
			data: {
				cid: cid,
				content: JSON.stringify({device:{userAgent:"kahoot.js",screen:{width:2000,height:1000}}}),
				gameid: me.gameID,
				host: "kahoot.it",
				type: "relogin"
			},
			ext: {},
			id: me.msgID + ""
		};
		me.send([packet]);
	}
	login(name,team) {
		var me = this;
		if(!me.ready){
			setTimeout(()=>{me.login(name);},500);
			return;
		}
		me.name = name;
		var joinPacket = [{
			channel: "/service/controller",
			clientId: me.clientID,
			data: {
				content: '{"device":{"userAgent":"kahoot.js","screen":{"width":1280,"height":800}}}',
				gameid: me.gameID,
				host: consts.ENDPOINT_URI,
				name: me.name,
				type: "login"
			},
			ext: {},
			participantUserId: null,
			id: me.msgID + ""
		}];
		me.msgID++;
		this.send(joinPacket);
		if(me.kahoot.gamemode == "team"){
			const joinPacket2 = [{
				channel: "/service/controller",
				clientId: me.clientID,
				data: {
					content: JSON.stringify(team && typeof(team.push) == "function" && team.length ? team : ["Player 1","Player 2","Player 3","Player 4"]),
					gameid: me.gameID,
					host: consts.ENDPOINT_URI,
					id: 18,
					type: "message"
				},
				ext: {},
				participantUserId: null,
				id: me.msgID + ""
			}];
			me.msgID++;
			me.send(joinPacket2);
		}
	}
	close() {
		this.connected = false;
		this.emit("close");
	}
	leave(){
		var me = this;
		me.msgID++;
		try{me.timesync.tc = Date.now();}catch(err){console.log(err);}
		//console.log(me.timesync);
		me.send([{
			channel: "/meta/disconnect",
			clientId: me.clientID,
			ext: {
				timesync: me.timesync
			},
			id: me.msgID + ""
		}]).then(setTimeout(()=>{me.ws.close();},500));
	}
}
module.exports = WSHandler;
