module.exports = function(){
  this.handlers.nameAccept = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 14){
      const data = JSON.parse(message.data.content);
      this.name = data.playerName;

      /**
       * NameAccept event
       *
       * @type {Object}
       * @property {String} playerName The player's name (may have changed from original value due to filter)
       * @property {String} quizType
       * @property {Boolean} playerV2
       */
      this.emit("NameAccept",data);
      delete this.handlers.nameAccept;
    }
  };
};
