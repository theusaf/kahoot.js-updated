// A test to verify all the properties of the Kahoot.js assets are working properly
var Kahoot = require("../index.js");
var client = new Kahoot;
const PIN = parseInt(require("fs").readFileSync("PIN.txt"));
console.log("joining game...");
client.join(PIN, "kahoot.js");
client.on("joined", () => {
    console.log("joined the game. waiting for quiz to start");
});
client.on("quiz", quiz => {
	// List all the properties of a quiz
	console.log("quiz has started. properties:");
	console.log("name: " + quiz.name);
	console.log("type: " + quiz.type);
	console.log("answercount: " + quiz.answerCount);
	console.log("currentQuestion: " + quiz.currentQuestion);
});
client.on("question", q => {
	console.log("question recieved. properties:");
	console.log("index: " + q.index);
	console.log("timeLeft: "+ q.timeLeft);
	console.log("type: " + q.type);
	console.log("usesStoryBlocks: " + q.usesStoryBlocks);
	console.log("ended: " + q.ended);
	console.log("number: " + q.number);
});
client.on("questionStart", q => {
	console.log("question started.");
	q.answer(0); // answer to be able to recieve the questionSubmit event
});
client.on("questionEnd", e => {
	console.log("question ended. event properties:");
	console.log("text: " + e.text);
	console.log("correctAnswers: " + e.correctAnswers);
	console.log("nemisis: " + e.nemisis);
	console.log("correct: " + e.correct);
	console.log("ended: " + e.question.ended);
});
client.on("questionSubmit", e => {
	console.log("question submitted. event properties: ");
	console.log(e.message);
	console.log(e.question);
});
client.on("finishText", e => {
	console.log("got finishText event, properties:");
	console.log(e.messages);
	console.log(e.metal);
});
client.on("finish", e => {
	console.log("finished, event properties:");
	console.log("players: " + e.players);
	console.log("quizID: " + e.quizID);
	console.log("rank: " + e.rank);
	console.log("correct: " + e.correct);
	console.log("incorrect: " + e.incorrect);
})
