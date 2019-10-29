var Kahoot = require("../index.js");
var client = new Kahoot;
const PIN = parseInt(require("fs").readFileSync("PIN.txt"));
console.log("joining game...");
client.join(PIN, "kahoots.js");
client.on("ready", () => {
    console.log("joined. leaving..");
    setTimeout(()=>{client.leave();},5000);
});
