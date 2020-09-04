var Kahoot = require("../index.js");
var client = new Kahoot;
//client.loggingMode = true;
const PIN = require("fs").readFileSync("PIN.json");
console.log("joining game...");
client.join("0" + parseInt(PIN), Math.random());
client.on("Joined", () => {
  console.log("joined the game. waiting for quiz to start");
});
client.on("QuizStart", quiz => {
  console.log("quiz has started. waiting for questions..");
  //console.log(quiz);
});
client.on("QuestionStart", question => {
  console.log("question started. not answering.");
});
client.on("QuestionReady",question=>{
  console.log("recieved question");
  //console.log(question);
});
client.on("QuestionEnd",q=>{
  console.log("question ended");
  console.log(q);
});
client.on("QuizEnd", (o) => {
  console.log("the quiz has finished.");
  console.log(o);
});
client.on("Podium",t=>{
  console.log("podium");
  console.log(t);
});
client.on("Disconnect",(r)=>{
  console.log("diconnected: " + r);
});
