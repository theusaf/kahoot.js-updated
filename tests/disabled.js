var Kahoot = require("../index.js");
var client = new Kahoot({
  modules: {
    extraData: false,
    feedback: false,
    gameReset: false,
    quizStart: false,
    quizEnd: false,
    podium: false,
    timeOver: false,
    reconnect: false,
    questionReady: false,
    questionStart: false,
    questionEnd: false,
    nameAccept: false,
    teamAccept: false,
    teamTalk: false,
    backup: false,
    answer: false
  }
});
const PIN = require("./PIN.json");
client.join(PIN,"I am disabled",["hi"]);
client.on("Joined",()=>{
  console.log("I'm in!");
});
client.on("Disconnect",r=>{
  console.log("I'm out: " + r);
});
client.on("QuestionStart",(q)=>{
  console.log("Somehow received a question start event");
});

// not disabled
var client2 = new Kahoot;
client2.join(PIN,"",["bye"]);
client2.on("Joined",()=>{
  console.log("I'm in!");
});
client2.on("Disconnect",r=>{
  console.log("I'm out: " + r);
});
client2.on("QuizStart",e=>{
  console.log(e.questionCount);
});
client2.on("QuestionStart",(q)=>{
  console.log("Received a question start event");
  console.log(q);
  q.answer(0);
});
