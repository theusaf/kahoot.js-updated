var Kahoot = require("../index.js");
var client = new Kahoot;
const PIN = require("fs").readFileSync("PIN.txt").toString("utf8").replace("\n","");
console.log("joining game...");
client.join(PIN, "welp");
client.on("joined", () => {
	console.log("joined the game. waiting for quiz to start");
});
client.on("quiz", quiz => {
	console.log("quiz has started. waiting for questions..");
	//console.log(quiz);
});
client.on("questionStart", question => {
	console.log("question started. answering.");
	// find correct answer
	const choices = question.rawEvent.choices;
	let foo = [];
	for(let i in choices){
		if(choices[i].correct){
			if(question.type == "open_ended" || question.type == "word_cloud"){
				question.answer(choices[i].answer);
				return;
			}
			if(question.type == "jumble"){
				question.answer([0,1,2,3]);
				return;
			}
			if(question.type == "multiple_select_quiz"){
				foo.push(i);
				continue;
			}
			question.answer(i);
			return;
		}
	}
	if(foo.length){
		question.answer(foo);
	}else{
		question.answer(0);
	}
});
client.on("question",question=>{
	console.log("recieved question");
	//console.log(question);
});
client.on("questionEnd",q=>{
	console.log("question ended");
	//console.log(q);
});
client.on("questionSubmit",()=>{
	console.log("submitted");
});
client.on("finish", (o) => {
	console.log("the quiz has finished.");
	console.log(o);
});
client.on("finishText",t=>{
	console.log(t);
});
client.on("quizEnd",()=>{
	console.log("diconnected");
});
