# Kahoot.js Documentation
## Table of Contents
1. [Classes](#classes)
2. [Kahoot](#kahoot)
  - [Events](#kahoot.events)
    - [ready/joined](#kahoot.events.ready)
    - [quizStart/quiz](#kahoot.events.quiz)
    - [question](#kahoot.events.question)
    - [questionStart](#kahoot.events.questionStart)
    - [questionSubmit](#kahoot.events.questionSubmit)
    - [questionEnd](#kahoot.events.questionEnd)
    - [finish](#kahoot.events.finish)
    - [finishText](#kahoot.events.finishText)
    - [2Step](#kahoot.events.2Step)
    - [2StepFail](#kahoot.events.2StepFail)
    - [2StepSuccess](#kahoot.events.2StepSuccess)
    - [feedback](#kahoot.events.feedback)
    - [invalidName](#kahoot.events.invalidName)
    - [locked](#kahoot.events.locked)
    - [handshakeFailed](#kahoot.events.handshakeFailed)
  - [Methods](#kahoot.methods)
    - [join](#kahoot.methods.join)
    - [reconnect](#kahoot.methods.reconnect)
    - [answerQuestion](#kahoot.methods.answerQuestion)
    - [answer2Step](#kahoot.methods.answer2Step)
    - [leave](#kahoot.methods.leave)
    - [sendFeedback](#kahoot.methods.sendFeedback)
  - [Properties](#kahoot.properties)
    - [~~sendingAnswer~~](#kahoot.properties.sendingAnswer)
    - [token](#kahoot.properties.token)
    - [sessionID](#kahoot.properties.sessionID)
    - [name](#kahoot.properties.name)
    - [quiz](#kahoot.properties.quiz)
    - [nemesis](#kahoot.properties.nemesis)
    - [nemeses](#kahoot.properties.nemeses)
    - [totalScore](#kahoot.properties.totalScore)
    - [cid](#kahoot.properties.cid)
    - [team](#kahoot.properties.team)
    - [hasTwoFactorAuth](#kahoot.properties.hasTwoFactorAuth)
    - [usesNamerator](#kahoot.properties.usesNamerator)
    - [gamemode](#kahoot.properties.gamemode)
    - [loggingMode](#kahoot.properties.loggingMode)
3. [Quiz](#quiz)
  - [Properties](#quiz.properties)
    - [client](#quiz.properties.client)
    - [type](#quiz.properties.type)
    - [currentQuestion](#quiz.properties.currentQuestion)
    - [questions](#quiz.properties.questions)
    - [questionCount](#quiz.properties.questionCount)
    - [answerCounts](#quiz.properties.answerCounts)
4. [Question](#question)
  - [Methods](#question.methods)
    - [answer](#question.methods.answer)
  - [Properties](#question.properties)
    - [client](#question.properties.client)
    - [quiz](#question.properties.quiz)
    - [index](#question.properties.index)
    - [timeLeft](#question.properties.timeLeft)
    - [type](#question.properties.type)
    - [layout](#question.properties.layout)
    - [ended](#question.properties.ended)
    - [number](#question.properties.number)
    - [gamemode](#question.properties.gamemode)
5. [QuestionEndEvent](#questionendevent)
  - [Properties](#questionendevent.properties)
    - [client](#questionendevent.properties.client)
    - [quiz](#questionendevent.properties.quiz)
    - [question](#questionendevent.properties.question)
    - [correctAnswer](#questionendevent.properties.correctAnswer)
    - [correctAnswers](#questionendevent.properties.correctAnswers)
    - [text](#questionendevent.properties.text)
    - [correct](#questionendevent.properties.correct)
    - [nemesis](#questionendevent.properties.nemesis)
    - [points](#questionendevent.properties.points)
    - [rank](#questionendevent.properties.rank)
    - [streak](#questionendevent.properties.streak)
    - [total](#questionendevent.properties.total)
6. [QuestionSubmitEvent](#questionsubmitevent)
  - [Properties](#questionsubmitevent.properties)
    - [client](#questionsubmitevent.properties.client)
    - [quiz](#questionsubmitevent.properties.quiz)
    - [question](#questionsubmitevent.properties.question)
7. [Nemesis](#nemesis)
  - [Properties](#nemesis.properties)
    - [name](#nemesis.properties.name)
    - [score](#nemesis.properties.score)
    - [exists](#nemesis.properties.exists)
8. [FinishTextEvent](#finishtextevent)
  - [Properties](#finishtextevent.properties)
    - [metal](#finishtextevent.properties.metal)
9. [QuizFinishEvent](#quizfinishevent)
  - [Properties](#quizfinishevent.properties)
    - [client](#quizfinishevent.properties.client)
    - [quiz](#quizfinishevent.properties.quiz)
    - [players](#quizfinishevent.properties.player)
    - [quizID](#quizfinishevent.properties.quizID)
    - [rank](#quizfinishevent.properties.rank)
    - [correct](#quizfinishevent.properties.correct)
    - [incorrect](#quizfinishevent.properties.incorrect)
10. [Q and A](#qa)
11. [Using Proxies](#qa.proxies)

## Classes
### Kahoot
---
The kahoot client that interacts with kahoot's quiz api.
<a name="kahoot.events"></a>
#### Events
<a name="kahoot.events.ready"></a>
`on('ready')` and `on('joined')`
- Emitted when the client joins the game.

<a name="kahoot.events.quiz"></a>
`on('quizStart', Quiz)` and `on('quiz', Quiz)`
- Emitted when the quiz starts for the client.
- Passes a `Quiz` class.

<a name="kahoot.events.question"></a>
`on('question', Question)`
- Emitted when the client receives a new question.
- This is **NOT** the same as the `questionStart` event, which is emitted after the question has started.
- Passes a `Question` class.

<a name="kahoot.events.questionStart"></a>
`on('questionStart', Question)`
- Emitted when a question starts.
    - Questions can be answered using `Question.answer(data)`
- Passes a `Question` class.

<a name="kahoot.events.questionSubmit"></a>
`on('questionSubmit', QuestionSubmitEvent)`
- Emitted when your answer has been submitted.
- Passes a `QuestionSubmitEvent` class.

<a name="kahoot.events.questionEnd"></a>
`on('questionEnd', QuestionEndEvent)`
- Emitted when a question ends.
- Passes a `QuestionEndEvent` class.

<a name="kahoot.events.finish"></a>
`on('finish', QuizFinishEvent)`
- Emitted when the quiz ends.
- Passes a `QuizFinishEvent` class.

<a name="kahoot.events.finishText"></a>
`on('finishText', FinishTextEvent)`
- Emitted when the quiz finish text is sent.
- Passes a `FinishTextEvent` class.

<a name="kahoot.events.disconnect"></a>
`on('quizEnd')` and `on('disconnect')`
- Emitted when the quiz closes, and the client is disconnected.

<a name="kahoot.events.2Step"></a>
`on('2Step')`
- Emitted when the 2 Step Auth is recieved
- Emitted when the 2 Step Auth is refreshed

<a name="kahoot.events.2StepFail"></a>
`on('2StepFail')`
- Emitted when the 2 Step Auth is incorrect

<a name="kahoot.events.2StepSuccess"></a>
`on('2Step')`
- Emitted when the 2 Step Auth is correct

<a name="kahoot.events.feedback"></a>
`on('feedback')`
- Emitted when the host requests to see feedback.

<a name="kahoot.events.invalidName"></a>
`on('invalidName',Error)`
- Emitted when the join name is a duplicate.
- Error is a String that describes the error.
  - Sometimes, `invalidName` is emitted when the pin provided is broken.

<a name="kahoot.events.locked"></a>
`on('locked')`
- Emitted when joining a game that is locked.

<a name="kahoot.events.handshakeFailed"></a>
`on('handshakeFailed')`
- Emitted when the the websocket connection failed/was blocked.

<a name="kahoot.methods"></a>
#### Methods
<a name="kahoot.methods.join"></a>
`join(sessionID, playerName, teamNames)`
- Joins the game.
- Parameters:
  - ***sessionID (Number)*** - The Kahoot session ID to join.
  - ***playerName (String)*** - The name of the user.
  - ***teamNames (Array) [String]*** - The names of the team members to be used in team game modes (optional).
  - Returns: `Promise`

<a name="kahoot.methods.reconnect"></a>
`reconnect()`
- Reconnects the bot.
- Should be used if connection is lost (network issue).
- Returns: `undefined`

<a name="kahoot.methods.answerQuestion"></a>
`answerQuestion(id)`
- Answers the current question.
- Parameters:
  - ***id (Number|Array|String)***
    - for type "quiz," use a number (0-3) to specify the choice.
    - for type "open_ended" and "word_cloud," use a string to specify the answer.
    - for type "jumble," use an array of numbers (0-3) to specify the order of items.
  - Returns: `Promise`

<a name="kahoot.methods.answer2Step"></a>
`answer2Step(steps)`
- Answers the 2 Step Auth.
- Parameters:
  - ***steps (Array)***
    - An array of the steps for the 2 step authentification. (numbers 0-3)
  - Returns: `Promise`

<a name="kahoot.methods.leave"></a>
`leave()`
- Leaves the game.
- Returns: `Promise`

<a name="kahoot.methods.sendFeedback"></a>
`sendFeedback(fun, learning, recommend, overall)`
- Sends feedback to the host.
- Parameters:
  - ***fun (Number)***
    - A number to rate how much fun you had (1-5)
  - ***learning (Number)***
    - A number to rate if you learned anything (1 or 0)
  - ***recommend (Number)***
    - A number to rate if you would recommend (1 or 0)
  - ***overall (Number)***
    - A Number to rate how you felt (-1 - 1)
        - 1 = good
        - -1 = bad
- Returns: `Promise`

<a name="kahoot.properties"></a>
#### Properties
<a name="kahoot.properties.sendingAnswer"></a>
`sendingAnswer (Boolean)`
- Whether or not the client is currently sending an answer.

<a name="kahoot.properties.token"></a>
`token (String)`
- The client token of the user.

<a name="kahoot.properties.sessionID"></a>
`sessionID (Number)`
- The session ID of the quiz.

<a name="kahoot.properties.name"></a>
`name (String)`
- The user's name.

<a name="kahoot.properties.quiz"></a>
`quiz (Quiz)`
- The current quiz of the client.

<a name="kahoot.properties.nemesis"></a>
`nemesis (Nemesis)`
- The client's nemesis. (Will be `null` if the client does not have a nemesis.)

<a name="kahoot.properties.nemeses"></a>
`nemeses (Nemesis Array)`
- An array of all the client's past nemeses.

<a name="kahoot.properties.totalScore"></a>
`totalScore (Number)`
- The client's accumulated score.

<a name="kahoot.properties.cid"></a>
`cid`
- The client's client id.

<a name="kahoot.properties.team"></a>
`team (Array) [String]`
- The team member names.

<a name="kahoot.properties.gamemode"></a>
`gamemode (String)`
- The game mode of the kahoot.
  - `classic` - normal kahoot game.
  - `team` - kahoot game with teams.

<a name="kahoot.properties.loggingMode"></a>
`loggingMode (Boolean)`
- Whether to log the messages from and to the server. Defaults to false.

<a name="kahoot.properties.usesNamerator"></a>
`usesNamerator (Boolean)`
- Whether the kahoot is using the namerator.

<a name="kahoot.properties.hasTwoFactorAuth"></a>
`hasTwoFactorAuth (Boolean)`
- Whether the kahoot is using two factor authentification.

### Quiz
---
<a name="quiz.properties"></a>
#### Properties
<a name="quiz.properties.client"></a>
`client (Kahoot)`
- The client the quiz is attached.

<a name="quiz.properties.name"></a>
`name (String)`
- The name of the quiz. This has been removed by Kahoot and will always be `null` now.

<a name="quiz.properties.type"></a>
`type (String)`
- The quiz type.

<a name="quiz.properties.currentQuestion"></a>
`currentQuestion (Question)`
- The current question the quiz is on.

<a name="quiz.properties.questions"></a>
`questions (Question Array)`
- An array of every single question in the quiz. New questions get added as they come in.

<a name="quiz.properties.questionNumber"></a>
`questionCount (Number)`
- The number of questions in the quiz.

<a name="quiz.properties.answerCounts"></a>
`answerCounts (Array) [Number]`
- An array that shows the # of choices per question in the quiz.

### Question
---
<a name="question.methods"></a>
#### Methods
<a name="question.methods.answer"></a>
`answer(number)`
- Parameters:
  - ***number (Number)***
    - The question number to answer. (0 is the first answer, 1 is the second answer, etc.)

<a name="question.properties"></a>
#### Properties
<a name="question.properties.client"></a>
`client (Kahoot)`
- The client attached to the question.

<a name="question.properties.quiz"></a>
`quiz (Quiz)`
- The quiz that the question for.

<a name="question.properties.index"></a>
`index (Number)`
- The index of the question.

<a name="question.properties.timeLeft"></a>
`timeLeft (Number)`
- The time left before the question starts.

<a name="question.properties.type"></a>
`type (String)`
- The question type.
  - "quiz" is the basic multiple choice quesiton.
  - "survey" is a poll, there aren't any points.
  - "content" is a slideshow, you don't need to answer this one.
  - "jumble" is a puzzle question, send an array of numbers to order the answers.
  - "open_ended" is a free response question; send text.
  - "word_cloud" is a free response poll; send text.

<a name="question.properties.layout"></a>
`layout (String)`
- The layout of the question.
- Example values: "TRUE_FALSE", "CLASSIC"

<a name="question.properties.ended"></a>
`ended (Boolean)`
- Whether or not the question has ended.

<a name="question.properties.number"></a>
`number (Number)`
- The number of the question.

<a name="question.properties.gamemode"></a>
`gamemode (String)`
- The game mode of the session. It can be either "classic" or "team."

### QuestionEndEvent
---
<a name="questionendevent.properties"></a>
#### Properties
<a name="questionendevent.properties.client"></a>
`client (Kahoot)`
- The client attached to the event.

<a name="questionendevent.properties.quiz"></a>
`quiz (Quiz)`
- The quiz that the event is attached to.

<a name="questionendevent.properties.question"></a>
`question (Question)`
- The question that the event is attached to.

<a name="questionendevent.properties.correctAnswers"></a>
`correctAnswers (String Array)`
- A list of the correct answers.

<a name="questionendevent.properties.correctAnswer"></a>
`correctAnswer (String)`
- The correct answer. (if there are multiple correct answers, this will be the first correct answer.)

<a name="questionendevent.properties.text"></a>
`text (String)`
- The text sent by Kahoot after a question has finished.

<a name="questionendevent.properties.correct"></a>
`correct (Boolean)`
- Whether or not the client got the question right.

<a name="questionendevent.properties.nemesis"></a>
`nemesis (Nemesis)`
- The client's nemesis. (Will be `null` if the client does not have a nemesis.)

<a name="questionendevent.properties.points"></a>
`points (Number)`
- The points earned from this question.

<a name="questionendevent.properties.streak"></a>
`streak (Number)`
- The current correct streak.

<a name="questionendevent.properties.rank"></a>
`rank (Number)`
- The rank of the client

<a name="questionendevent.properties.total"></a>
`total (Number)`
- The total score of the client

### QuestionSubmitEvent
---
<a name="questionsubmitevent.properties"></a>
#### Properties
<a name="questionsubmitevent.properties.client"></a>
`client (Kahoot)`
- The client attached to the event.

<a name="questionsubmitevent.properties.quiz"></a>
`quiz (Quiz)`
- The quiz attached to the event.

<a name="questionsubmitevent.properties.question"></a>
`question (Question)`
- The question attached to the event.

### Nemesis
---
<a name="nemesis.properties"></a>
#### Properties
<a name="nemesis.properties.name"></a>
`name (String)`
- The name of the nemesis user.

<a name="nemesis.properties.score"></a>
`score (Number)`
- The score of the nemesis user.

<a name="nemesis.properties.isGhost"></a>
`isGhost (Boolean)`
- Whether or not the nemesis user is a ghost player or not.

<a name="nemesis.properties.exists"></a>
`exists (Boolean)`
- Whether or not the nemesis exists (All other values will be `undefined` if this is `false`)

### FinishTextEvent
---
<a name="finishtextevent.properties"></a>
#### Properties

<a name="finishtextevent.properties.metal"></a>
`metal (String)`
- The medal recieved after the quiz.

### QuizFinishEvent
---
<a name="quizfinishevent.properties"></a>
#### Properties
<a name="quizfinishevent.properties.client"></a>
`client (Kahoot)`
- The client attached to the event.

<a name="quizfinishevent.properties.quiz"></a>
`quiz (Quiz)`
- The quiz attached to the event.

<a name="quizfinishevent.properties.players"></a>
`players (Number)`
- The number of players on the quiz.

<a name="quizfinishevent.properties.quizID"></a>
`quizID (String)`
- The ID of the quiz.
- This is **ONLY** sent at the end of the quiz.

<a name="quizfinishevent.properties.rank"></a>
`rank (Number)`
- The client's ranking on the quiz.

<a name="quizfinishevent.properties.correct"></a>
`correct (Number)`
- The number of questions that were scored correct.

<a name="quizfinishevent.properties.incorrect"></a>
`incorrect (Number)`
- The number of questions that were scored incorrect.

#### All events have a .rawEvent property, which contains the raw information from Kahoot.

---
<a name="qa"></a>
## Q and A
<a name="qa.proxies"></a>
### Using Proxies
This package (**V1.2.12+**) now has support for use of proxies. This will request the session information using the proxy, but the websocket will still be directly connected.
Proxies can either be a **String** or an **Object** like so:
```js
const proxy1 = "http://cors-server.example.com/";
const proxy2 = {
  proxy: "http://other-server.example.com/path/",
  options: {
    headers: {
      "X-Requested-With": "foobar"
    },
    method: "POST"
  },
  nopath: true
};
```
#### Example Usage:
```js
const kahootJS = require("kahoot.js-updated");
const bots = [];
for(let i = 0; i < 10; ++i){
  let client;
  if(Math.round(Math.random())){
    client = new kahootJS(proxy1);
  }else{
    client = new kahootJS(proxy2);
  }
  client.join(pin);
  bots.push(client);
}
```
#### The Proxy Option
Proxies must be in this format in order to work:<br/>
`https://sub.domain.top/<path>/<query>`
- The information is requested by appending the proxy to the start of the url:<br>
`"https://sub.domain.top/path/" + "https://kahoot.it/reserve/session/12345/?12418"`
- This can be prevented by using the nopath option.

The options is the [HTTP Request Options](https://nodejs.org/api/http.html#http_http_request_options_callback), which should only be used if the proxy service requires special headers to work. You can also set the method used.

**Proxies are only used to specify HTTP requests for the tokens and for challenge games. If the websocket connection is blocked, you need to use a proxy/vpn for your server.**
