var Kahoot = require("../index.js");
var client = new Kahoot("cors-anywhere.herokuapp.com");
const PIN = parseInt(require("fs").readFileSync("PIN.txt"));
console.log("joining game...");
client.join(PIN, "testing",["a","b","c","d"]);
client.on("ready", () => {
    console.log("joined. leaving..");
    setTimeout(()=>{client.leave();},5000);
});
client.on("invalidName",()=>{
  console.log("bad");
  setTimeout(()=>{client.join(PIN,"testing2");},5000);
});
