var Promise = require("promise");

class Quiz {
	constructor(name, type, answerCount, client, amount) {
		this.client = client;
		this.name = name;
		this.type = type;
		this.answerCount = answerCount;
		this.currentQuestion = null;
		this.questions = [];
		this.questionCount = amount;
	}
}
class Question {
	constructor(rawEvent, client) {
		this.client = client;
		this.quiz = client.quiz;
		this.index = rawEvent.questionIndex;
		this.timeLeft = rawEvent.timeLeft;
		this.type = rawEvent.type,
		this.usesStoryBlocks = rawEvent.useStoryBlocks;
		this.ended = false;
		this.quiz.questions.push(this);
		this.number = this.quiz.questions.length;
		this.quiz.currentQuestion = this;
	}
	answer(number) {
		return new Promise((fulfill, reject) => {
			if (!number && number !== 0) reject("Question answer is missing question number!");
			else {
				this.client.answerQuestion(number).then(() => {
					fulfill();
				}).catch(reject);
			}
		});
	}
}
class QuestionEndEvent {
	constructor(rawEvent, client) {
		try{
			this.client = client;
			this.quiz = client.quiz;
			this.question = this.quiz.questions[this.quiz.questions.length - 1];
			this.question.ended = true;
			this.correctAnswers = rawEvent.correctAnswers;
			this.correctAnswer = this.correctAnswers[0];
			this.text = rawEvent.text;
			this.correct = rawEvent.correct;
			this.nemesis = new Nemesis(rawEvent.nemesis);
			this.quiz.client.nemesis = this.nemesis;
			this.quiz.client.nemeses.push(this.nemesis);
			this.points = rawEvent.points;
			this.rank = rawEvent.rank;
			this.total = rawEvent.totalScore;
		}catch(e){
			console.log("GET_END_EVT_ERR"); //this error will usually only happen if you join during the game.
		}
	}
}
class QuestionSubmitEvent {
	constructor(message, client) {
		this.message = message;
		this.client = client;
		this.quiz = client.quiz;
		this.question = this.quiz.questions[this.quiz.questions.length - 1];
	}
}
class Nemesis {
	constructor(rawData) {
		if (rawData) {
			this.name = rawData.name;
			this.id = rawData.cid;
			this.score = rawData.totalScore;
			this.isKicked = rawData.isKicked;
			this.exists = true;
		} else {
			this.name = null;
			this.id = null;
			this.score = null;
			this.isKicked = null;
			this.exists = false;
		}
	}
}
class FinishTextEvent {
	constructor(rawEvent) {
		this.fistMessage = rawEvent.msg1;
		this.secondMessage = rawEvent.msg2;
		this.messages = [
			this.firstMessage,
			this.secondMessage
		];
		this.metal = rawEvent.metal;
	}
}
class QuizFinishEvent {
	constructor(rawEvent, client) {
		this.client = client;
		this.quiz = client.quiz;
		this.players = rawEvent.playerCount;
		this.quizID = rawEvent.quizID;
		this.rank = rawEvent.rank;
		this.correct = rawEvent.correct;
		this.incorrect = rawEvent.incorrect;
	}
}
module.exports = {
	Quiz: Quiz,
	Question: Question,
	QuestionEndEvent: QuestionEndEvent,
	QuestionSubmitEvent: QuestionSubmitEvent,
	Nemesis: Nemesis,
	FinishTextEvent: FinishTextEvent,
	QuizFinishEvent: QuizFinishEvent
}
