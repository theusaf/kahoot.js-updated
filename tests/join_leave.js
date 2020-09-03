var Kahoot = require("../index.js");
var client = new Kahoot;
const PIN = require("./PIN.json");
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
