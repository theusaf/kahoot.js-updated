var Kahoot = require("../index.js");
var client = new Kahoot;
const PIN = require("./PIN.json");
const fs = require("fs");
const sleep = require("../src/util/sleep.js");
console.log("joining game...");
client.join(PIN, "kahoot.js",["a","b","c","d"]).then(a=>{
  console.log(a);
}).catch(e=>{
  console.log(e);
});
client.on("Joined", () => {
  console.log("joined.");
});
client.on("TwoFactorReset",async ()=>{
  console.log("Two Factor Enabled. Trying to answer");
  client.answerTwoFactorAuth(shuffle([0,1,2,3]));
});
client.on("TwoFactorWrong",()=>{
  console.log("Darn. Got it wrong.");
});
client.on("TwoFactorCorrect",()=>{
  console.log("Yay! I'm in!");
});
client.on("TeamAccept",t=>{
  console.log(t.memberNames);
});
client.on("NameAccept",n=>{
  console.log(n.playerName);
});
client.on("TimeOver",()=>{
  console.log("Times up");
});
client.on("QuestionStart",(q)=>{
  if(Math.random() > 0.5){return console.log("Not answering");}
  console.log("answering");
  q.answer(0);
});
client.on("Podium",()=>{
  console.log("Podium time!");
});
client.on("QuizEnd",()=>{
  console.log("Quiz ended");
});
client.on("QuestionEnd",d=>{
  console.log("question ended");
});

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
