const EventEmitter = require("events");
const {URL} = require("url");
const http = require("http");
const https = require("https");
const emoji = require("./emoji.js");

// overwrites functions
function Injector(){
  this.data = this.data || {};
  Object.assign(this.data,{
    totalScore: 0,
    totalScoreNoBonus: 0,
    totalStreak: 0,
    streak: -1,
    phase: "start",
    questionIndex: 0
  });

  this.answer = async (choice,empty)=>{
    const question = this.challengeData.kahoot.questions[this.data.questionIndex];
    let tick = Date.now() - this.receivedQuestionTime;
    if(this.defaults.options.ChallengeGetFullScore || this.defaults.options.ChallengeWaitForInput || this.challengeData.challenge.game_options.question_timer){
      tick = 1;
    }
    const pointsQuestion = question.points || false;
    const timeScore = +this.defaults.options.ChallengeScore || ((Math.round((1 - ((tick / question.time) / 2)) * 1000) * question.pointsMultiplier) * +pointsQuestion);
    if(this.data.streak === -1){
      this.data.streak = 0;
      console.log(this.challengeData)
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
      if(typeof choice.length === "undefined"){
        choice = [];
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
      if(typeof choice.length === "undefined"){
        choice = [];
      }
      correct = true;
      let i = 0;
      for(let ch of choice){
        if(question.choices[ch].correct){
          c2.push(i);
        }
        i++;
        if((correct && question.choices[ch].correct) || alwaysCorrect){
          correct = true;
          score += timeScore;
        }else{
          score = 0;
          correct = false;
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
            playerCid: this.cid,
            playerId: this.name,
            points: +correct * score,
            reactionTime: tick,
            receivedTime: this.receivedQuestionTime,
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
        startTime: 0,
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
    clearTimeout(this.ti);
    const event = {
      choice,
      type: question.type,
      isCorrect: correct,
      text,
      receivedTime: Date.now(),
      pointsQuestion,
      points: score,
      correctAnswers: c,
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
      }
    };
    return this._httpRequest(`https://kahoot.it/rest/challenges/${this.challengeData.challenge.challengeId}/answers`,{
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(JSON.stringify(payload))
      },
      method: "POST"
    },false,JSON.stringify(payload)).then((data)=>{
      if(empty === null){
        return event;
      }
      this.ti = setTimeout(()=>{
        this.emit("TimeOver");
        this.emit("QuestionEnd",event);
        this.next();
      },5000);
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
        if(Object.keys(inf).length !== 0){
          this.challengeData.progress = inf;
        }
        this.data.phase = "answer";
        let q = this.challengeData.kahoot.questions[this.data.questionIndex];
        this.emit("QuestionReady",Object.assign(q,{
          questionIndex: this.data.questionIndex,
          timeLeft: 5,
          gameBlockType: q.type,
          gameBlockLayout: q.layout,
          quizQuestionAnswers: this.quiz.quizQuestionAnswers
        }));
        setTimeout(()=>{this.next();},5000);
      });
      break;
    }
    case "answer": {
      let q = this.challengeData.kahoot.questions[this.data.questionIndex];
      this.receivedQuestionTime = Date.now();
      this.emit("QuestionStart",{
        questionIndex: this.data.questionIndex,
        gameBlockType: q.type,
        gameBlockLayout: q.layout,
        quizQuestionAnswers: this.quiz.quizQuestionAnswers,
        timeAvailable: q.time
      });
      this.data.phase = "leaderboard";
      if(!q){
        this.disconnectReason = "Unknown Error";
        this.socket.close();
        return;
      }
      if(this.challengeData.challenge.game_options.question_timer && !this.defaults.options.ChallengeWaitForInput){
        this.ti = setTimeout(async()=>{
          if(q.type === "content"){
            this.data.questionIndex++;
            this.data.phase = "ready";
            if(this.data.questionIndex === this.challengeData.kahoot.questions.length){
              this.data.phase = "close";
            }
          }
          this.data.streak = 0;
          const evt = await this.answer(null,null);
          if(q.type !== "content"){
            this.emit("QuestionEnd",evt);
          }
          this.next();
        },q.time || 5000);
      }
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
      this.emit("QuizEnd",this.data.finalResult);
      this.emit("Podium",{
        podiumMedalType: ["gold","silver","bronze"][this._getRank() - 1]
      });
      if(this.defaults.options.ChallengeAutoContinue){
        setTimeout(()=>{
          this.next();
        },5000);
      }
      break;
    }
    case "complete":{
      this.stop = true;
      this.disconnectReason = "Session Ended";
      this.socket.close();
    }
    }
  };

  this.leave = ()=>{
    this.stop = true;
    this.disconnectReason = "Player Left";
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

  this._calculateStreakBonus = ()=>{
    if(this.defaults.options.ChallengeUseStreakBonus){
      if(this.data.streak >= 5){
        return 500;
      }else{
        return this.data.streak * 100;
      }
    }else{
      return 0;
    }
  };

  this._send = async (m)=>{
    if(m.data && m.data.type === "login"){
      this.name = m.data.name + "";
      let count = 0;
      for(let p of this.challengeData.progress.playerProgress.playerProgressEntries){
        if(!p.questionMetrics){
          break;
        }
        if(this.name in p.questionMetrics){
          if(this.challengeData.progress.summary.playersUnfinished && this.challengeData.progress.summary.playersUnfinished.filter(o=>{
            return o.playerId === this.name;
          }).length){
            const pl = this.challengeData.progress.summary.playersUnfinished.filter(o=>{
              return o.playerId == this.name;
            })[0];
            this.data.totalScore = pl.finalScore;
            this.data.questionIndex = pl.totalAnswerCount; // should load the next question probably
            count = pl.totalAnswerCount;
          }else{
            joined(0);
            setTimeout(()=>{
              this.disconnectReason = "Session Ended";
              this.socket.close();
            },2000);
            return this.challengeData;
          }
        }else{
          break;
        }
      }
      if(count > 0){
        for(let u of this.challengeData.challenge.challengeUsersList){
          if(u.nickname === this.name){
            this.cid = u.playerCid;
            break;
          }
        }
        joined(this.cid);
        if(this.defaults.options.ChallengeAutoContinue){
          setTimeout(()=>{this.next();},5000);
        }
        return this.challengeData;
      }
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
      });
    }
  };

  this._httpRequest = (url,opts,json,packet)=>{
    return new Promise((resolve, reject)=>{
      function handleRequest(res){
        const chunks = [];
        res.on("data",(chunk)=>{
          chunks.push(chunk);
        });
        res.on("end",()=>{
          const data = Buffer.concat(chunks).toString("utf8");
          if(json){
            resolve(JSON.parse(data));
          }
        });
      }
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
        path: parsed.pathname + (parsed.search || "")
      };
      Object.assign(options,opts);
      const proxyOptions = this.defaults.proxy(options);
      options = proxyOptions || options;
      let req;
      if(options.protocol === "https:"){
        req = https.request(options,handleRequest);
      }else{
        req = http.request(options,handleRequest);
      }
      req.on("error",(e)=>{reject(e);});
      req.end(packet);
    });
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
        if(latest[i] > totalScore){
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
    if(q){
      return this._httpRequest(`https://kahoot.it/rest/challenges/${this.challengeData.challenge.challengeId}/progress/?upToQuestion=${q}`,null,true);
    }else{
      return this._httpRequest(`https://kahoot.it/rest/challenges/pin/${this.gameid}`,null,true).then((data)=>{
        return this._httpRequest(`https://kahoot.it/rest/challenges/${data.challenge.challengeId}/progress`,null,true).then((progress)=>{
          return Object.assign(data,{progress});
        });
      });
    }
  };

  this._getProgress().then(inf=>{
    if(Object.keys(inf.progress).length == 0){
      this.disconnectReason = "Invalid Challenge";
      return this.socket.close();
    }
    this.challengeData = inf;
    if(inf.challenge.endTime <= Date.now() || inf.challenge.challengeUsersList.length >= inf.challenge.maxPlayers){
      this.disconnectReason = "Challenge Ended/Full";
      return this.socket.close();
    }else{
      this.emit("HandshakeComplete");
    }
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
      this.emit("close");
    };
  }
}

module.exports = ChallengeHandler;
