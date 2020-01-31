var Kahoot = require("../index.js");
const PIN = parseInt(require("fs").readFileSync("PIN.txt"));
const readline = require('readline');
const r = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

r.question("How many bots?",n=>{
  n = Number(n);
  for(let i = 0;i<n;i++){
    const c = new Kahoot;
    c.join(PIN,"test"+i);
  }
});
