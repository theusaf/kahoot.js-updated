var Kahoot = require("../index.js");
var client = new Kahoot;
const PIN = require("./PIN.json");
console.log("joining game...");
client.join(PIN);
client.on("Joined", () => {
  console.log("joined the game. waiting for quiz to start");
});
client.on("QuestionReady",q=>{
  console.log(q);
});
client.on("QuestionStart", question => {
  console.log("question started. answering 0.");
  console.log(question);
  question.answer(0);
});
client.on("Feedback",()=>{
  console.log("sending feedback");
  client.sendFeedback(3,1,1,1);
});
