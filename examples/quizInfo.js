var Kahoot = require("kahoot.js-updated");
var k = new Kahoot;
console.log("joining kahoot");
k.join(7877502 /* or any other kahoot token */, "kahoot.js").then(() => {
	console.log("Joined the kahoot. Waiting for it to start.");
	k.on("quiz", quiz => {
		console.log("The quiz has started!");
		console.log("Quiz name:", quiz.name);
		console.log("Quiz type:", quiz.type);
		// Leave the Kahoot after the info has been printed
		k.leave();
	});
});
