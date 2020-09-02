module.exports = function(){
  this.handlers.teamAccept = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 19){
      const data = JSON.parse(message.data.content);

      /**
       * NameAccept event. Emitted when the name was accepted.
       *
       * @event Client#TeamAccept
       * @type {Object}
       * @property {String[]} memberNames The team members names.
       * @property {RecoveryData} recoveryData The recovery data (contains the current event)
       */
      this.emit("TeamAccept",data);
      delete this.handlers.teamAccept;
      if(this.handlers.recovery){
        this.handlers.recovery({
          channel: "/service/player",
          data: {
            id: 17,
            content: JSON.stringify(data.recoveryData)
          }
        });
      }
    }
  };
};
