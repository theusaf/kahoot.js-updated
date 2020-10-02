var Kahoot = require("../index.js");
var client = new Kahoot;
let PIN;
try{PIN=require("./PIN.json");}catch(e){PIN=12345;}
console.log("joining game...");
client.join(PIN, "testing",["a","b","c","d"]).then(a=>{
  console.log(a);
}).catch(e=>{
  console.log(e);
});
client.on("Joined", () => {
  console.log("joined. leaving..");
  setTimeout(()=>{client.leave();},5000);
});
