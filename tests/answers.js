var Kahoot = require("../index.js");
var client = new Kahoot;
//const PIN = parseInt(require("fs").readFileSync("PIN.txt"));
console.log("joining game...");
client.join(978966, "kahoo.js");
client.on("joined", () => {
    console.log("joined the game. waiting for quiz to start");
});
client.on("quiz", quiz => {
	console.log("quiz has started. waiting for questions..");
});
client.on("questionStart", question => {
	console.log("question started. answering 0.");
	question.answer(0);
});
client.on("questionSubmit",a=>{
  console.log(a);
});
client.on("finish", () => {
	console.log("the quiz has finished.");
})
