var Kahoot = require("kahoot.js-updated");
var client = new Kahoot;
console.log("Joining kahoot...");
client.join(9802345 /* Or any other kahoot token */, "kahoot.js");
client.on("joined", () => {
    console.log("I joined the Kahoot!");
});
client.on("quizStart", quiz => {
    console.log("The quiz has started! The quiz's name is:", quiz.name);
});
client.on("questionStart", question => {
    console.log("A new question has started, answering the first answer.");
    question.answer(0);
});
client.on("quizEnd", () => {
    console.log("The quiz has ended.");
});
