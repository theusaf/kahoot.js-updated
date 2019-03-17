var Kahoot = require("kahoot.js-updated");
var k = new Kahoot;
console.log("Joining kahoot...");
k.join(9802345 /* Or any other kahoot token */, "kahoot.js").then(() => {
	k.on("quizStart", quiz => {
    	console.log("the quiz started with name", quiz.name);
	});
	k.on("questionStart", question => {
	    console.log("A new question has started, answering the first answer.");
	    question.answer(0);
	});
	k.on("questionEnd", event => {
		console.log("the question ended.");
		if (k.nemesis && k.nemesis.exists) {
			console.log("i have a nemesis with name", nemesis.name);
		} else {
			console.log("i dont have a nemesis.");
		}
	});
	k.on("quizEnd", () => {
	    console.log("the quiz ended");
	});
});
