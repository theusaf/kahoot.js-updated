module.exports = class LiveBaseMessage{
  constructor(client,channel,data){
    this.channel = channel;
    this.clientId = client.clientId;
    if(data){this.data = data;}
    this.ext = {};
  }
};
