var Kahoot = require("../index.js");
var client = new Kahoot;
const PIN = parseInt(require("fs").readFileSync("PIN.txt"));
console.log("joining game...");
const test = client.join(PIN, "testing",["a","b","c","d"]).then(a=>{
	console.log(a);
}).catch(e=>{
	console.log(e);
});
client.on("ready", () => {
	console.log("joined. leaving..");
	setTimeout(()=>{client.leave();},5000);
});
client.on("invalidName",()=>{
	console.log("bad");
	setTimeout(()=>{client.join(PIN,"testing2");},5000);
});
