var Kahoot = require("../index.js");
var client = new Kahoot;
const PIN = parseInt(require("fs").readFileSync("PIN.txt"));
console.log("joining game...");
client.join(PIN, "kahoot.js");
client.on("joined", () => {
    console.log("joined. leaving..");
    client.leave();
});
