var Kahoot = require("../index.js");
const PIN = parseInt(require("fs").readFileSync("PIN.txt"));
const readline = require("readline");
const r = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

r.question("How many bots?",n=>{
  n = Number(n);
  let i = 0;
  const a = setInterval(()=>{
    if(i >= n){
      clearInterval(a);
    }
    const c = new Kahoot;
    c.join(PIN,"test"+i);
    i++;
    let l = Number(i);
    c.on("disconnect",()=>{
      console.log("leaving" + l);
      c.leave();
    });
  },350);
  r.close();
});
