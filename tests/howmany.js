var Kahoot = require("../index.js");
const PIN = require("./PIN.json");
const readline = require("readline");
const r = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

r.question("How many bots? ",n=>{
  n = +n;
  let i = 0;
  const a = setInterval(()=>{
    const j = i + 1;
    const {client,event} = Kahoot.join(PIN,"bot-" + (++i));
    event.then(()=>{
      console.log("Bot " + j + " joined!");
    }).catch((e)=>{
      console.log("Bot " + j + " failed to join:");
      console.log(e);
      client.leave();
    });
    client.on("Disconnect",(reason)=>{
      console.log("Bot " + j + " disconnected: " + reason);
    });
    if(i >= n){
      clearInterval(a);
    }
  },35);
  r.close();
});
