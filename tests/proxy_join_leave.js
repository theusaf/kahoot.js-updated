// not working yet.
var Kahoot = require("../index.js");
var client = new Kahoot({
  proxy: (options)=>{
    const {host,path} = options;
    return Object.assign(options,{
      host: "cors-anywhere.herokuapp.com",
      path: `/https://${host}${path}`
    });
  }
});

client.join(require("./PIN.json"));

client.on("Joined",()=>{
  console.log("Joined the game! Leaving");
  setTimeout(()=>{
    client.leave();
  },5000);
});

client.on("Disconnect",(reason)=>{
  console.log("Left the game: " + reason);
});
