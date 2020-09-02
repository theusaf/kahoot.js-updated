var Kahoot = require("../index.js");
var client = new Kahoot;
const PIN = parseInt(require("fs").readFileSync("PIN.txt"));
console.log("joining game...");
client.join(PIN, "kahoot.js");
client.on("joined", () => {
  console.log("joined the game. waiting for quiz to start");
});
client.on("quiz", quiz => {
  console.log("quiz has started. waiting for questions..");
});
client.on("question",()=>{
  console.log("question preparation started");
});
client.on("questionStart", question => {
  console.log("question started. answering 0.");
  question.answer(0);
});
client.on("finish", (o) => {
  console.log("the quiz has finished.");
});
