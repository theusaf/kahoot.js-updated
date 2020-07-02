const EventEmitter = require("events");
var Promise = require("promise");
var Assets = require("./Assets.js");
var WSHandler = require("./WSHandler.js");
const ChallengeHandler = require("./ChallengeHandler.js");
var token = require("./token.js");

class Kahoot extends EventEmitter {
	constructor(proxies,options) {
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
		this.gamemode = null;
		this.cid = "";
		this.proxies = proxies;
		this.loggingMode = false;
		this.options = Object.assign({
			ChallengeAutoContinue: true,
			ChallengeGetFullScore: false
		},options);
	}
	reconnect() {
		if (this.sessionID && this.cid && this._wsHandler && this._wsHandler.ws.readyState >= 2) {
			if(this.sessionID[0] == "0"){
				return;
			}
			token.resolve(this.sessionID, (resolvedToken, content) => {
				if(!resolvedToken){
					return;
				}
				this.gamemode = content.gameMode || "classic";
				this.hasTwoFactorAuth = content.twoFactorAuth || false;
				this.usesNamerator = content.namerator || false;
				this.token = resolvedToken;
				this._wsHandler = new WSHandler(this.sessionID, this.token, this);
				this._wsHandler.on("error", e => {
					this.emit("handshakeFailed",e);
					// reject(e);
				});
				this._wsHandler.on("invalidName", (err) => {
					this.emit("invalidName",err);
				});
				this._wsHandler.on("locked",()=>{
					this.emit("locked");
				});
				this._wsHandler.on("2StepFail",()=>{
					this.emit("2StepFail");
				});
				this._wsHandler.on("2StepSuccess",()=>{
					this.emit("2StepSuccess");
				});
				this._wsHandler.on("2Step", () => {
					this.emit("2Step");
				});
				this._wsHandler.on("ready", () => {
					this._wsHandler.relog(this.cid);
				});
				this._wsHandler.on("joined", () => {
					this.emit("ready");
					this.emit("joined");
					//fulfill();
				});
				this._wsHandler.on("quizData", quizInfo => {
					this.quiz = new Assets.Quiz(quizInfo.type, quizInfo.qCount, this, quizInfo.totalQ, quizInfo.quizQuestionAnswers, quizInfo);
					this.emit("quizStart", this.quiz);
					this.emit("quiz", this.quiz);
				});
				this._wsHandler.on("quizUpdate", updateInfo => {
					this.quiz.currentQuestion = new Assets.Question(updateInfo, this);
					this.emit("question", this.quiz.currentQuestion);
				});
				this._wsHandler.on("questionEnd", endInfo => {
					var e = new Assets.QuestionEndEvent(endInfo, this);
					this.totalScore = e.total;
					this.emit("questionEnd", e);
				});
				this._wsHandler.on("quizEnd", () => {
					this.emit("quizEnd");
					this.emit("disconnect");
				});
				this._wsHandler.on("questionStart", () => {
					try {
						this.emit("questionStart", this.quiz.currentQuestion);
					} catch (e) {
						//joined during quiz (fixed v 1.1.1)
					}
				});
				this._wsHandler.on("questionSubmit", message => {
					this.sendingAnswer = false;
					var e = new Assets.QuestionSubmitEvent(message, this);
					this.emit("questionSubmit", e);
					try {
						this._qFulfill(e);
					} catch (e) {}
				});
				this._wsHandler.on("finishText", data => {
					var e = new Assets.FinishTextEvent(data);
					this.emit("finishText", e);
				});
				this._wsHandler.on("finish", data => {
					var e = new Assets.QuizFinishEvent(data, this);
					this.emit("finish", e);
				});
				this._wsHandler.on("feedback", () => {
					this.emit("feedback");
				});
			}, this.proxies);
		}
	}
	join(session, name, team) {
		return new Promise((fulfill, reject) => {
			if (!session) {
				reject("You need a sessionID to connect to a Kahoot!");
				return;
			}
			if (!name) {
				reject("You need a name to connect to a Kahoot!");
				return;
			}
			this.sessionID = session;
			this.name = name;
			this.team = team;
			token.resolve(session, (resolvedToken, content) => {
				if(!resolvedToken){
					return reject("token_error");
				}
				this.gamemode = content.gameMode || "classic";
				this.hasTwoFactorAuth = content.twoFactorAuth || false;
				this.usesNamerator = content.namerator || false;
				this.token = resolvedToken;
				if(resolvedToken === true){
					this._wsHandler = new ChallengeHandler(this,content,this.proxies);
				}else{
					this._wsHandler = new WSHandler(this.sessionID, this.token, this);
				}
				this._wsHandler.on("error", e => {
					this.emit("handshakeFailed",e);
					reject(e);
				});
				this._wsHandler.on("invalidName", err => {
					this.emit("invalidName",err);
					reject();
				});
				this._wsHandler.on("locked",()=>{
					this.emit("locked");
				});
				this._wsHandler.on("2StepFail",()=>{
					this.emit("2StepFail");
				});
				this._wsHandler.on("2StepSuccess",()=>{
					this.emit("2StepSuccess");
				});
				this._wsHandler.on("2Step", () => {
					this.emit("2Step");
				});
				this._wsHandler.on("ready", () => {
					this._wsHandler.login(this.name, this.team);
				});
				this._wsHandler.on("joined", () => {
					this.emit("ready");
					this.emit("joined");
					if(this.hasTwoFactorAuth){
						this.emit("2Step");
					}
					fulfill(null);
				});
				this._wsHandler.on("quizData", quizInfo => {
					this.quiz = new Assets.Quiz(quizInfo.type, quizInfo.qCount, this, quizInfo.totalQ, quizInfo.quizQuestionAnswers, quizInfo);
					this.emit("quizStart", this.quiz);
					this.emit("quiz", this.quiz);
				});
				this._wsHandler.on("quizUpdate", updateInfo => {
					this.quiz.currentQuestion = new Assets.Question(updateInfo, this);
					this.emit("question", this.quiz.currentQuestion);
				});
				this._wsHandler.on("questionEnd", endInfo => {
					var e = new Assets.QuestionEndEvent(endInfo, this);
					this.totalScore = e.total;
					this.emit("questionEnd", e);
				});
				this._wsHandler.on("quizEnd", () => {
					this.emit("quizEnd");
					this.emit("disconnect");
				});
				this._wsHandler.on("questionStart", () => {
					try {
						this.emit("questionStart", this.quiz.currentQuestion);
					} catch (e) {
						//joined during quiz (fixed v 1.1.1)
					}
				});
				this._wsHandler.on("questionSubmit", message => {
					this.sendingAnswer = false;
					var e = new Assets.QuestionSubmitEvent(message, this);
					this.emit("questionSubmit", e);
					try {
						this._qFulfill(e);
					} catch (e) {}
				});
				this._wsHandler.on("finishText", data => {
					var e = new Assets.FinishTextEvent(data);
					this.emit("finishText", e);
				});
				this._wsHandler.on("finish", data => {
					var e = new Assets.QuizFinishEvent(data, this);
					this.emit("finish", e);
				});
				this._wsHandler.on("feedback", () => {
					this.emit("feedback");
				});
			}, this.proxies);
		});
	}
	answer2Step(steps) {
		return new Promise((fulfill, reject) => {
			this._qFulfill = fulfill;
			this._wsHandler.send2Step(steps.join(""));
		});
	}
	answerQuestion(id,question,secret) {
		return new Promise((fulfill, reject) => {
			this._qFulfill = fulfill;
			this.sendingAnswer = true;
			if(!question){
				question = this.quiz.currentQuestion;
			}
			this._wsHandler.sendSubmit(id,question,secret);
		});
	}
	leave() {
		return new Promise((fulfill, reject) => {
			this._wsHandler.leave();
			fulfill();
		});
	}
	//content: "{"totalScore":0,"fun":5,"learning":1,"recommend":1,"overall":1,"nickname":"oof"}"
	sendFeedback(fun, learning, recommend, overall) {
		return new Promise((f, r) => {
			this._wsHandler.sendFeedback(fun, learning, recommend, overall);
		});
	}
	// challenge-specific functions
	next(){
		if(this.gamemode == "challenge"){
			this._wsHandler.next();
		}
	}
}
module.exports = Kahoot;
