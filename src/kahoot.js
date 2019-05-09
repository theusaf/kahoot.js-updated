const EventEmitter = require("events");
var Promise = require("promise");
var Assets = require("./Assets.js");
var WSHandler = require("./WSHandler.js");
var token = require("./token.js");

class Kahoot extends EventEmitter {
	constructor() {
		super();
		this._wsHandler = null;
		this._qFulfill = null;
		this.sendingAnswer = false;
		this.token = null;
		this.sessionID = null;
		this.name = null;
		this.quiz = null;
		this.nemesis = null;
		this.nemeses = [];
		this.totalScore = 0;
	}
	join(session, name) {
		var me = this;
		return new Promise((fulfill, reject) => {
			if (!session) {
				reject("You need a sessionID to connect to a Kahoot!");
				return;
			}
			if (!name) {
				reject("You need a name to connect to a Kahoot!");
				return;
			}
			me.sessionID = session;
			me.name = name;
			token.resolve(session, resolvedToken => {
				me.token = resolvedToken;
				me._wsHandler = new WSHandler(me.sessionID, me.token, me);
				me._wsHandler.on("2step",()=>{
					me.emit("2Step");
				});
				me._wsHandler.on("ready", () => {
					me._wsHandler.login(me.name);
				});
				me._wsHandler.on("joined", () => {
					me.emit("ready");
					me.emit("joined");
					fulfill();
				});
				me._wsHandler.on("quizData", quizInfo => {
					me.quiz = new Assets.Quiz(quizInfo.name, quizInfo.type, quizInfo.qCount, me, quizInfo.totalQ);
					me.emit("quizStart", me.quiz);
					me.emit("quiz", me.quiz);
				});
				me._wsHandler.on("quizUpdate", updateInfo => {
					me.quiz.currentQuestion = new Assets.Question(updateInfo, me);
					me.emit("question", me.quiz.currentQuestion);
				});
				me._wsHandler.on("questionEnd", endInfo => {
					var e = new Assets.QuestionEndEvent(endInfo, me);
					me.totalScore = e.total;
					me.emit("questionEnd", e);
				});
				me._wsHandler.on("quizEnd", () => {
					me.emit("quizEnd");
					me.emit("disconnect");
				});
				me._wsHandler.on("questionStart", () => {
					try{
						me.emit("questionStart", me.quiz.currentQuestion);
					}catch(e){
						//joined during quiz (fixed v 1.1.1)
					}
				});
				me._wsHandler.on("questionSubmit", message => {
					me.sendingAnswer = false;
					var e = new Assets.QuestionSubmitEvent(message, me);
					me.emit("questionSubmit", e);
					try {
						me._qFulfill(e);
					} catch(e) { }
				});
				me._wsHandler.on("finishText", data => {
					var e = new Assets.FinishTextEvent(data);
					me.emit("finishText", e);
				});
				me._wsHandler.on("finish", data => {
					var e = new Assets.QuizFinishEvent(data, me);
					me.emit("finish", e);
				});
				me._wsHandler.on("feedback", ()=>{
					me.emit("feedback");
				})
			});
		});
	}
	answer2Step(steps){
		var me = this;
		return new Promise((f,r)=>{
			me._qFulfill = f;
			me._wsHandler.send2Step(steps.join(""));
		});
	}
	answerQuestion(id) {
		var me = this;
		return new Promise((fulfill, reject) => {
			me._qFulfill = fulfill;
			me.sendingAnswer = true;
			me._wsHandler.sendSubmit(id);
		});
	}
	leave() {
		return new Promise((fulfill, reject) => {
			this._wsHandler.ws.close();
			fulfill();
		});
	}
	//content: "{"totalScore":0,"fun":5,"learning":1,"recommend":1,"overall":1,"nickname":"oof"}"
	sendFeedback(fun,learning,recommend,overall){
		return new Promise((f,r)=>{
			this._wsHandler.sendFeedback(fun,learning,recommend,overall);
		});
	}
}
module.exports = Kahoot;
