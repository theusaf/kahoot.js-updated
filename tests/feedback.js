var Kahoot = require("../index.js");
var client = new Kahoot;
const PIN = require("./PIN.js");
console.log("joining game...");
client.join(PIN, "kahoot.js");
client.on("Joined", () => {
  console.log("joined the game. waiting for quiz to start");
});
client.on("QuestionStart", question => {
  console.log("question started. answering 0.");
  question.answer(0);
});
client.on("Feedback",()=>{
  console.log("sending feedback");
  client.sendFeedback(3,1,1,1);
});
