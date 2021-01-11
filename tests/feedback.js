var Kahoot = require("../index.js");
var client = new Kahoot;
const PIN = require("./PIN.json");
console.log("joining game...");
client.join(PIN);
client.on("Joined", () => {
  console.log("joined the game. waiting for quiz to start");
});
client.on("QuestionReady",q=>{
  console.log(q.index);
});
client.on("QuestionStart", question => {
  console.log("question started. answering 0.");
  console.log(question.index);
  question.answer(0);
});
client.on("Feedback",()=>{
  console.log("sending feedback");
  client.sendFeedback(3,1,0,-1);
});
client.on("Podium",(t)=>{
  console.log(t);
});
client.on("QuizEnd",(q)=>{
  console.log(q);
});
