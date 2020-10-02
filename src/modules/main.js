const LiveClientHandshake = require("../assets/LiveClientHandshake.js");
const LiveJoinPacket = require("../assets/LiveJoinPacket.js");
const LiveJoinTeamPacket = require("../assets/LiveJoinTeamPacket.js");
const LiveTwoStepAnswer = require("../assets/LiveTwoStepAnswer.js");
const LiveLeavePacket = require("../assets/LiveLeavePacket.js");
/**
 * @fileinfo This is the main module
 * - Always enabled
 * - Loads many things, such as two factor auth.
 * - Runs the handshakes, pings, disconnects, and promises.
 */
module.exports = function(){
  this.classes.LiveTwoStepAnswer = LiveTwoStepAnswer;
  this.classes.LiveJoinPacket = LiveJoinPacket;
  this.classes.LiveClientHandshake = LiveClientHandshake;
  this.classes.LiveJoinTeamPacket = LiveJoinTeamPacket;
  this.classes.LiveLeavePacket = LiveLeavePacket;

  /**
   * HandshakeChecker - Handles the handshake to Kahoot!
   * @param {Object} message The incoming websocket message.
   */
  this.handlers.HandshakeChecker = (message)=>{
    if(message.channel === "/meta/handshake"){
      if(message.clientId){
        this.clientId = message.clientId;
        const serverTime = message.ext.timesync;
        const l = Math.round((Date.now() - serverTime.tc - serverTime.p) / 2);
        const o = serverTime.ts - serverTime.tc - l;
        this._timesync = {
          l,
          o,
          get tc(){
            return Date.now();
          }
        };
        this._send(new LiveClientHandshake(1,this._timesync,this));
        delete this.handlers.HandshakeChecker; // no more need.
      }else{
        // error!
        this.emit("HandshakeFailed",message);
        this.socket.close();
      }
    }
  };

  /**
   * PingChecker - Handles the ping/pong messages
   * @param {Object} message The incoming websocket message
   */
  this.handlers.PingChecker = (message)=>{
    if(message.channel === "/meta/connect" && message.ext){
      if(message.advice && message.advice.reconnect === "retry"){
        this.emit("HandshakeComplete");
      }
      this._send(new LiveClientHandshake(2,message,this));
    }
  };

  /**
   * timetrack - handles the 'timetrack' events
   * @param {Object} message The incoming websocket message
   */
  this.handlers.timetrack = (message)=>{

    /**
     * An object about the time events were received
     * @namespace {Object} LiveEventTimetrack
     *
     * @property {String} channel The channel the message is responding to
     * @property {Object} ext An object that looks like this:
     * @example
     * {
     *   "timetrack": 265834652 // date received
     * }
     * @property {String<Number>} id The message id this message is responding to
     * @property {Boolean} successful Whether the message was successful
     */
    if(this.waiting){
      if(this.waiting[message.id]){
        // hooray
        this.waiting[message.id](message);
        delete this.waiting[message.id];
      }
    }
  };

  /**
   * TwoFactor - handles the 2FA events
   * @param {Object} message the incoming websocket message
   */
  this.handlers.TwoFactor = (message)=>{
    if(this.settings && !this.settings.twoFactorAuth){
      delete this.handlers.TwoFactor;
      return;
    }
    if(message.channel === "/service/player" && message.data){
      if(message.data.id === 53){

        /**
         * TwoFactorReset Event. Emitted when the two-factor auth resets and hasn't been answered correctly yet
         *
         * @event Client#TwoFactorReset
         */
        this.twoFactorResetTime = Date.now();
        this.emit("TwoFactorReset");
      }else if(message.data.id === 51){

        /**
         * TwoFactorWrong Event. Emitted when the two-factor auth was answered incorrectly.
         *
         * @event Client#TwoFactorWrong
         */
        this.emit("TwoFactorWrong");
      }else if(message.data.id === 52){

        /**
         * TwoFactorCorrect Event. Emitted when the two-factor auth was answered correctly. Enables other events to start.
         *
         * @event Client#TwoFactorCorrect
         */
        this.connected = true;
        this.emit("TwoFactorCorrect");
        if(this.lastEvent){
          this.emit.apply(this,this.lastEvent);
        }
        delete this.lastEvent;
        delete this.twoFactorResetTime;
        delete this.handlers.TwoFactor;
      }
    }
  };

  /**
   * Disconnect - handles disconnection
   * @param {Object} message The incoming websocket message
   */
  this.handlers.Disconnect = (message)=>{
    if(message.channel === "/service/player" && message.data && message.data.id === 10){
      const content = JSON.parse(message.data.content);
      if(content.kickCode){
        this.disconnectReason = "Kicked";
      }else{
        this.disconnectReason = "Session Ended";
      }
      this.leave(true);
    }
  };
};
