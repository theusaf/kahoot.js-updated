var Kahoot = require("../index.js");
var client = new Kahoot;
const PIN = parseInt(require("fs").readFileSync("PIN.txt"));
console.log("joining game...");
client.join(PIN, "kahoot.js");
client.on("joined", () => {
    console.log("joined the game");
});
client.on("quiz", () => {
	console.log("quiz start");
});
client.on("questionStart", q => {
	q.answer(0);
});
client.on("questionEnd", e => {
	console.log("question ended. Nemisis:");
	if (client.nemisis && client.nemisis.exists) {
		console.log("name: " + client.nemisis.name);
		console.log("id: " + client.nemisis.id);
		console.log("score: " + client.nemisis.score);
		console.log("isKicked: " + client.nemisis.isKicked);
	} else console.log("i have no nemisis right now");
});
