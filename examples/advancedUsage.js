var Kahoot = require("kahoot.js-updated");
var k = new Kahoot;
console.log("Joining kahoot...");
k.join(7877502 /* Or any other kahoot token */, "kahoot.js").then(() => {
	console.log("joined quiz");
	k.on("quizStart", quiz => {
    	console.log("quiz "" + quiz.name + "" has started");
	});
	k.on("question", question => {
		console.log("Recieved a new question. waiting until it starts..");
	});
	k.on("questionStart", question => {
	    console.log("question started. answering answer id 1 (answer 2)");
	    question.answer(1);
	});
	k.on("questionSubmit", event => {
		console.log("Submitted the answer. Kahoot says", event.message);
	});
	k.on("questionEnd", e => {
		console.log("the question ended.");
		if (e.correct) {
			console.log("i got the question right!");
		} else {
			console.log("my answer was incorrect. the correct answer is", e.correctAnswer);
		}
	});
	k.on("finishText", e => {
		console.log("the quiz is finishing, Kahoot says", e.firstMessage);
	});
	k.on("quizEnd", () => {
	    console.log("the quiz ended");
	});
});
