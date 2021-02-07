/**
 * @fileinfo This is the ChallengeHandler module
 * - Loads stuff used in challenges.
 */
const EventEmitter = require("events"),
  {URL} = require("url"),
  got = require("got"),
  emoji = require("./emoji.js");

// overwrites functions
function Injector(){
  this.data = this.data || {};
  Object.assign(this.data,{
    totalScore: 0,
    totalScoreNoBonus: 0,
    totalStreak: 0,
    streak: -1,
    phase: "start",
    questionIndex: 0,
    correctCount: 0,
    incorrectCount: 0,
    unansweredCount: 0
  });

  this.answer = async (choice,empty)=>{
    clearTimeout(this.ti);
    const question = this.challengeData.kahoot.questions[this.data.questionIndex];
    let tick = Date.now() - this.receivedQuestionTime;
    if(this.defaults.options.ChallengeGetFullScore || this.defaults.options.ChallengeWaitForInput || !this.challengeData.challenge.game_options.question_timer){
      tick = 1;
    }
    const pointsQuestion = this.challengeData.progress.questions.reverse()[0].pointsQuestion || false;
    if(+this.defaults.options.ChallengeScore > 1500){
      // Hard limit of 0 - 1,500. (anything higher = 0 on Kahoot's end)
      this.defaults.options.ChallengeScore = 1500;
    }else if(+this.defaults.options.ChallengeScore < 0){
      this.defaults.options.ChallengeScore = 0;
    }
    const timeScore = +this.defaults.options.ChallengeScore || ((Math.round((1 - ((tick / question.time) / 2)) * 1000) * question.pointsMultiplier) * +pointsQuestion);
    if(this.data.streak === -1){
      this.data.streak = 0;
      const ent = this.challengeData.progress.playerProgress.playerProgressEntries;
      let falseScore = 0;
      for(let q in ent){
        if(q >= this.data.questionIndex){
          break;
        }
        if(!ent[q].questionMetrics){
          break;
        }
        if(ent[q].questionMetrics[this.name] > falseScore || !this.challengeData.kahoot.questions[q].points){
          this.data.streak++;
        }else{
          this.data.streak = 0;
        }
        falseScore = ent[q].questionMetrics[this.name];
        this.data.score = falseScore;
      }
    }
    const alwaysCorrect = this.defaults.options.ChallengeAlwaysCorrect;
    let correct = false;
    let text = "";
    if(empty === null){
      choice = -1;
    }
    let choiceIndex = +choice;
    let c2 = [];
    let score = 0;
    switch (question.type) {
      case "quiz":{
        try{
          correct = question.choices[choiceIndex].correct;
          text = question.choices[choiceIndex].answer;
        }catch(e){
          correct = false;
          text = "";
        }finally{
          if(alwaysCorrect){correct = true;}
          if(correct){score+=timeScore;}
        }
        break;
      }
      case "jumble":{
        correct = JSON.stringify(choice) === JSON.stringify([0,1,2,3]);
        if(typeof choice != "object" || typeof choice.length === "undefined"){
          choice = [];
        }
        for(let j in choice){
          choice[j] = +choice[j];
        }
        let tmpList = [];
        for(let n of choice){
          try{
            tmpList.push(question.choices[n].answer);
          }catch(e){
            tmpList.push("");
          }
        }
        text = tmpList.join("|");
        choiceIndex = -1;
        if(alwaysCorrect){correct = true;}
        if(correct){score+=timeScore;}
        break;
      }
      case "multiple_select_quiz":{
        if(typeof choice != "object" || typeof choice.length === "undefined"){
          choice = [];
        }
        correct = true;
        let tmpList = [];
        for(let i in choice){
          choice[i] = +choice[i];
          tmpList.push(question.choices[i].answer);
        }
        tmpList = tmpList.join("|");
        for(let ch in question.choices){
          if(question.choices[ch].correct){
            c2.push(ch);
            if(choice.includes(+ch) || alwaysCorrect){
              if(correct){
                score += timeScore;
              }
            }else{
              score = 0;
              correct = false;
            }
          }
        }
        break;
      }
      case "open_ended":{
        text = choice + "";
        const invalid = /[~`!@#$%^&*(){}[\];:"'<,.>?/\\|\-_+=]/gm;
        const test = text.replace(invalid,"");
        for(let choice of question.choices){
          if(choice.answer.replace(emoji,"")){
            correct = test.replace(emoji,"").toLowerCase() == choice.answer.replace(emoji,"").replace(invalid,"").toLowerCase();
          }else{
            correct = test == choice;
          }
          if(correct){
            choiceIndex = question.choices.indexOf(choice);
            break;
          }
        }
        if(alwaysCorrect){correct = true;}
        if(correct){score+=timeScore;}
        break;
      }
      case "word_cloud":{
        text = choice + "";
        choiceIndex = -1;
        correct = true;
        if(this.defaults.options.ChallengeScore){
          score += timeScore;
        }
        break;
      }
      default:{
        choiceIndex = +choice || 0;
        text = (question.choices[choiceIndex] && question.choices[choiceIndex].answer) || "";
        correct = true;
        if(this.defaults.options.ChallengeScore){
          score += timeScore;
        }
      }
    }
    let c = [];
    if(question.choices){
      for(let choice of question.choices){
        if(choice.correct){
          c.push(choice.answer);
        }
      }
    }
    const oldstreak = this.data.streak;
    if(correct){this.data.streak++;}else{this.data.streak = 0;}
    const payload = {
      device: {
        screen: {
          width: 1920,
          height: 1080
        },
        userAgent: this.userAgent
      },
      gameMode: this.challengeData.progress.gameMode,
      gameOptions: this.challengeData.progress.gameOptions,
      hostOriganizationId: null,
      kickedPlayers: [],
      numQuestions: this.challengeData.kahoot.questions.length,
      organizationId: "",
      question: {
        answers: [
          {
            bonusPoints: {
              answerStreakBonus: this._calculateStreakBonus()
            },
            choiceIndex,
            isCorrect: correct,
            playerCid: +this.cid,
            playerId: this.name,
            points: +correct * score,
            reactionTime: tick,
            receivedTime: Date.now(),
            text
          }
        ],
        choices: question.choices,
        duration: question.time,
        format: question.questionFormat,
        index: this.data.questionIndex,
        lag: 0,
        layout: question.layout,
        playerCount: 1,
        pointsQuestion,
        skipped: (empty === null),
        startTime: this.receivedQuestionTime,
        title: question.question,
        type: question.type,
        video: question.video
      },
      quizId: this.challengeData.kahoot.uuid,
      quizMaster: this.challengeData.challenge.quizMaster,
      quizTitle: this.challengeData.kahoot.title,
      quizType: this.challengeData.progress.quizType,
      sessionId: this.gameid,
      startTime: this.challengeData.progress.timestamp
    };
    // small changes for specific types
    switch (question.type) {
      case "word_cloud":
      case "open_ended":{
        Object.assign(payload.question.answers[0],{
          originalText: text,
          text: text.toLowerCase().replace(/[~`!@#$%^&*(){}[\];:"'<,.>?/\\|\-_+=]/gm,"")
        });
        payload.question.choices = [];
        break;
      }
      case "jumble":{
        let f = choice;
        if(f.length !== 4){
          f = [3,2,1,0];
        }
        payload.question.answers[0].selectedJumbleOrder = f;
        break;
      }
      case "multiple_select_quiz":{
        payload.question.answers[0].selectedChoices = choice;
        payload.question.answers[0].choiceIndex = -5;
        break;
      }
      case "content":{
        Object.assign(payload.question.answers[0],{
          choiceIndex: -2,
          isCorrect: true,
          reactionTime: 0
        });
        break;
      }}
    let oldScore = score;
    score += payload.question.answers[0].bonusPoints.answerStreakBonus;
    this.data.totalStreak += score - oldScore;
    this.data.totalScoreNoBonus += oldScore;
    this.data.totalScore += score;
    if(correct){this.data.correctCount++;}
    if(!correct && empty === null){this.data.unansweredCount++;}
    if(!correct && empty !== null){this.data.incorrectCount++;}
    const event = {
      choice,
      type: question.type,
      isCorrect: correct,
      text,
      receivedTime: Date.now(),
      pointsQuestion,
      points: score,
      correctChoices: c2,
      totalScore: this.data.totalScore,
      rank: this._getRank(),
      nemesis: this._getNemesis(),
      pointsData: {
        questionPoints: oldScore,
        totalPointsWithBonuses: this.data.totalScore,
        totalPointsWithoutBonuses: this.data.totalScoreNoBonus,
        answerStreakPoints: {
          streakLevel: (correct && this.data.streak) || 0,
          streakBonus: this._calculateStreakBonus(),
          totalStreakPoints: this.data.totalStreak,
          previousStreakLevel: oldstreak,
          previousStreakBonus: this._calculateStreakBonus(oldstreak)
        }
      },
      lastGameBlockIndex: this.data.questionIndex < 0 ? 0 : this.data.questionIndex - 1
    };
    this.data.finalResult = {
      rank: event.rank,
      cid: this.cid,
      correctCount: this.data.correctCount,
      incorrectCount: this.data.incorrectCount,
      unansweredCount: this.data.unansweredCount,
      isKicked: false,
      isGhost: false,
      playerCount: this.challengeData.challenge.challengeUsersList.length + 1,
      startTime: this.challengeData.progress.timestamp,
      quizId: this.challengeData.kahoot.uuid,
      name: this.name,
      totalScore: this.data.totalScore,
      hostId: "",
      challengeId: "",
      isOnlyNonPointGameBlockKahoot: false
    };
    return this._httpRequest(`https://kahoot.it/rest/challenges/${this.challengeData.challenge.challengeId}/answers`,{
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(JSON.stringify(payload))
      },
      method: "POST"
    },false,JSON.stringify(payload)).finally((data)=>{
      if(empty === null){
        return event;
      }
      this.ti = setTimeout(()=>{
        this._emit("TimeOver");
        this._emit("QuestionEnd",event);
        this.next();
      },1000);
      return;
    });
  };

  /**
   * next - Go to the next part (challenge)
   *
   * @function Client#next
   */
  this.next = ()=>{
    if(this.stop){
      return;
    }
    switch (this.data.phase) {
      case "start": {
        this.data.phase = "ready";
        const kahoot = this.challengeData.kahoot;
        let qqa = [];
        for(let question of kahoot.questions){
          qqa.push(question.choices ? question.choices.length : null);
        }
        this._emit("QuizStart",{
          name: kahoot.title,
          quizQuestionAnswers: qqa
        });
        setTimeout(()=>{this.next();},5000);
        break;
      }
      case "ready": {
        this._getProgress(this.data.questionIndex).then((inf)=>{
          if(this.data.hitError === true){this.data.hitError = false;}
          if(Object.keys(inf).length !== 0){
            this.challengeData.progress = inf;
          }
          this.data.phase = "answer";
          let q = this.challengeData.kahoot.questions[this.data.questionIndex];
          this._emit("QuestionReady",Object.assign(q,{
            questionIndex: this.data.questionIndex,
            timeLeft: 5,
            gameBlockType: q.type,
            gameBlockLayout: q.layout,
            quizQuestionAnswers: this.quiz.quizQuestionAnswers
          })).catch((e)=>{
            this.leave("Failed to fetch challenge progress.");
          });
          setTimeout(()=>{this.next();},5000);
        }).catch((err)=>{
          if(this.data.hitError){
            // Assume something is terribly wrong.
            clearTimeout(this.ti);
            this.leave("Kahoot - Internal Server Error");
          }
          this.data.hitError = true;
          this.next();
        });
        break;
      }
      case "answer": {
        let q = this.challengeData.kahoot.questions[this.data.questionIndex];
        this.receivedQuestionTime = Date.now();
        this.data.phase = "leaderboard";
        if(!q){
          this.leave("Unknown Error");
          return;
        }
        if(q.type === "content"){
          this.data.questionIndex++;
          this.data.phase = "ready";
          if(this.data.questionIndex === this.challengeData.kahoot.questions.length){
            this.data.phase = "close";
          }
          if(this.challengeData.challenge.game_options.question_timer && !this.defaults.options.ChallengeWaitForInput){
            setTimeout(()=>{
              this.next();
            },10000);
          }
          return;
        }
        if(this.challengeData.challenge.game_options.question_timer && !this.defaults.options.ChallengeWaitForInput){
          this.ti = setTimeout(async()=>{
            const evt = await this.answer(null,null);
            if(q.type !== "content"){
              this._emit("TimeOver");
              this._emit("QuestionEnd",evt);
            }
            this.next();
          },q.time || 5000);
          this._emit("QuestionStart",Object.assign(q,{
            questionIndex: this.data.questionIndex,
            gameBlockType: q.type,
            gameBlockLayout: q.layout,
            quizQuestionAnswers: this.quiz.quizQuestionAnswers,
            timeAvailable: q.time
          }));
          return;
        }
        this._emit("QuestionStart",Object.assign(q,{
          questionIndex: this.data.questionIndex,
          gameBlockType: q.type,
          gameBlockLayout: q.layout,
          quizQuestionAnswers: this.quiz.quizQuestionAnswers,
          timeAvailable: q.time
        }));
        // else, you must do everything yourself.
        break;
      }
      case "leaderboard":{
        this.data.questionIndex++;
        this.data.phase = "ready";
        if(this.data.questionIndex === this.challengeData.kahoot.questions.length){
          this.data.phase = "close";
          if(this.defaults.options.ChallengeAutoContinue){
            setTimeout(()=>{this.next();},5000);
          }
          return;
        }
        if(this.defaults.options.ChallengeAutoContinue){
          setTimeout(()=>{this.next();},5000);
        }
        break;
      }
      case "close":{
        this.data.phase = "complete";
        this._emit("QuizEnd",this.data.finalResult);
        this._emit("Podium",{
          podiumMedalType: ["gold","silver","bronze"][this._getRank() - 1]
        });
        if(this.defaults.options.ChallengeAutoContinue){
          setTimeout(()=>{
            this.next();
          },30000);
        }
        break;
      }
      case "complete":{
        this.leave("Session Ended");
      }
    }
  };

  this.leave = (reason)=>{
    this.stop = true;
    this.disconnectReason = reason || "Player Left";
    this.socket.close();
  };

  const joined = (cid)=>{
    setTimeout(()=>{this.socket.emit("message",JSON.stringify([{
      channel: "/service/controller",
      data: {
        type: "loginResponse",
        cid: cid+""
      }
    }]));});
    this._send = async ()=>{throw "This error should not appear unless you are trying to do something silly.";};
  };

  this._calculateStreakBonus = (i)=>{
    let info = i || this.data.streak;
    if(this.defaults.options.ChallengeUseStreakBonus){
      if(info >= 6){
        return 500;
      }else if(info > 0){
        return (info - 1) * 100;
      }else{
        return 0;
      }
    }else{
      return 0;
    }
  };

  this._send = async (m)=>{
    if(m.data && m.data.type === "login"){
      this.name = m.data.name + "";

      /**
       * @since 2.0.0
       * Removed reconnecting - Client id not provided.
       */
      return this._httpRequest(`https://kahoot.it/rest/challenges/${this.challengeData.challenge.challengeId}/join/?nickname=${encodeURIComponent(this.name)}`,{
        method: "POST"
      },true).then((data)=>{
        if(data.error){
          throw data;
        }
        Object.assign(this.challengeData,data);
        this.cid = data.playerCid;
        joined(this.cid);
        if(this.defaults.options.ChallengeAutoContinue){
          setTimeout(()=>{this.next();},5000);
        }
        return this.challengeData;
      }).catch(()=>{
        this.leave("Error connecting to Challenge");
      });
    }
  };

  this._httpRequest = async (url,opts,json,packet)=>{
    const parsed = new URL(url);
    let options = {
      headers: {
        "User-Agent": this.userAgent,
        "Origin": "kahoot.it",
        "Referer": "https://kahoot.it/",
        "Accept-Language": "en-US,en;q=0.8",
        "Accept": "*/*"
      },
      host: parsed.hostname,
      protocol: parsed.protocol,
      path: parsed.pathname + (parsed.search || ""),
      retry: 3,
      body: packet
    };
    for(let i in opts){
      if(typeof opts[i] === "object"){
        if(!options[i]){
          options[i] = opts[i];
        }else{
          Object.assign(options[i],opts[i]);
        }
      }else{
        options[i] = opts[i];
      }
    }
    const proxyOptions = this.defaults.proxy(options);
    options = proxyOptions || options;
    if(this.loggingMode){
      console.log("SEND: " + JSON.stringify({
        options,
        packet
      }));
    }
    const request = got(options);
    this.emit("_Request", request);
    const req = await request;
    if(json){
      return JSON.parse(req.body);
    }else{
      return req.body;
    }
  };

  this._getNemesis = ()=>{
    if(!this.challengeData.progress.playerProgress){
      return null;
    }
    const scores = Array.from(this.challengeData.progress.playerProgress.playerProgressEntries);
    const latest = scores.reverse()[0].questionMetrics;
    let rank = 0;
    let name = null;
    let totalScore = null;
    for(let i in latest){
      if(i === this.name){
        continue;
      }
      if(latest[i] >= this.data.totalScore){
        rank++;
        if(latest[i] < totalScore || name === null){
          name = i;
          totalScore = latest[i];
        }
      }
    }
    if(rank){
      return {
        name,
        isGhost: false,
        rank,
        totalScore
      };
    }
  };

  this._getRank = ()=>{
    const nem = this._getNemesis();
    if(nem){
      return nem.rank + 1;
    }else{
      return 1;
    }
  };

  this._getProgress = (q)=>{
    if(typeof q !== "undefined"){
      return this._httpRequest(`https://kahoot.it/rest/challenges/${this.challengeData.challenge.challengeId}/progress/?upToQuestion=${q}`,null,true);
    }else{
      return this._httpRequest(`https://kahoot.it/rest/challenges/pin/${this.gameid}`,null,true).then((data)=>{
        return this._httpRequest(`https://kahoot.it/rest/challenges/${data.challenge.challengeId}/progress`,null,true).then((data2)=>{
          return Object.assign(data,{progress:data2});
        });
      });
    }
  };

  this._getProgress().then(inf=>{
    if(Object.keys(inf.progress).length == 0){
      return this.leave("Invalid Challenge");
    }
    this.challengeData = inf;
    if(inf.challenge.endTime <= Date.now() || inf.challenge.challengeUsersList.length >= inf.challenge.maxPlayers){
      return this.leave("Challenge Ended/Full");
    }else{
      this.emit("HandshakeComplete");
    }
  }).catch((e)=>{
    this.leave("Failed to fetch challenge progress.");
  });
}

// pretends to be a websocket
class ChallengeHandler extends EventEmitter{
  constructor(client,content){
    super();
    client.challengeData = content;
    Injector.call(client);
    this.readyState = 3;
    this.close = ()=>{
      this.stop = true;
      clearTimeout(client.ti);
      this.emit("close");
    };
  }
}

module.exports = ChallengeHandler;
