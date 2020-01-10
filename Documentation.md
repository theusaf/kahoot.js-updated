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
    - [feedback](#kahoot.events.feedback)
    - [invalidName](#kahoot.events.invalidName)
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
3. [Quiz](#quiz)
  - [Properties](#quiz.properties)
    - [client](#quiz.properties.client)
    - [name](#quiz.properties.name)
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
    - [~~usesStoryBlocks~~](#question.properties.usesStoryBlocks)
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
    - [total](#questionendevent.properties.total)
6. [QuestionSubmitEvent](#questionsubmitevent)
  - [Properties](#questionsubmitevent.properties)
    - [message](#questionsubmitevent.properties.message)
    - [client](#questionsubmitevent.properties.client)
    - [quiz](#questionsubmitevent.properties.quiz)
    - [question](#questionsubmitevent.properties.question)
7. [Nemesis](#nemesis)
  - [Properties](#nemesis.properties)
    - [name](#nemesis.properties.name)
    - [id](#nemesis.properties.id)
    - [score](#nemesis.properties.score)
    - [isKicked](#nemesis.properties.isKicked)
    - [exists](#nemesis.properties.exists)
8. [FinishTextEvent](#finishtextevent)
  - [Properties](#finishtextevent.properties)
    - [firstMessage](#finishtextevent.properties.firstMessage)
    - [secondMessage](#finishtextevent.properties.secondMessage)
    - [messages](#finishtextevent.properties.messages)
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

<a name="kahoot.events.feedback"></a>
`on('feedback')`
- Emitted when the host requests to see feedback.

<a name="kahoot.events.invalidName"></a>
`on('invalidName')`
- Emitted when the join name is a duplicate.

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
    - A Number to rate how you felt (1-3)
        - 1 = good
        - 3 = bad
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

### Quiz
---
<a name="quiz.properties"></a>
#### Properties
<a name="quiz.properties.client"></a>
`client (Kahoot)`
- The client the quiz is attached.

<a name="quiz.properties.name"></a>
`name (String)`
- The name of the quiz.
  - Note: this value may be `null` if you joined the quiz after it started

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

<a name="question.properties.usesStoryBlocks"></a>
`usesStoryBlocks (Boolean)`
- Whether or not the question uses 'Story Blocks'.
- I still don't know what this means.

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
<a name="questionsubmitevent.properties.message"></a>
`message (String)`
- The message sent by Kahoot after you sent in an answer.

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

<a name="nemesis.properties.id"></a>
`id (Number / String)`
- The client ID of the nemesis user

<a name="nemesis.properties.score"></a>
`score (Number)`
- The score of the nemesis user.

<a name="nemesis.properties.isKicked"></a>
`isKicked (Boolean)`
- Whether or not the nemesis user is kicked or not.

<a name="nemesis.properties.exists"></a>
`exists (Boolean)`
- Whether or not the nemesis exists (All other values will be `undefined` if this is `false`)

### FinishTextEvent
---
<a name="finishtextevent.properties"></a>
#### Properties
<a name="finishtextevent.properties.firstMessage"></a>
`firstMessage (String)`
- The first finishing message sent by Kahoot.

<a name="finishtextevent.properties.secondMessage"></a>
`secondMessage (String)`
- The second message sent by Kahoot. (this property will be `undefined` if a second message was not sent.)

<a name="finishtextevent.properties.messages"></a>
`messages (String Array)`
- An array of the messages sent.

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
