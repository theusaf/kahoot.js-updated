# Kahoot.js Documentation
## Table of Contents
1. [Classes](#classes)
2. [Kahoot](#kahoot)
  1. [Events](#kahoot.events)
    1. [ready/joined](#kahoot.events.ready)
    2. [quizStart/quiz](#kahoot.events.quiz)
    3. [question](#kahoot.events.question)
    4. [questionStart](#kahoot.events.questionStart)
    5. [questionSubmit](#kahoot.events.questionSubmit)
    6. [questionEnd](#kahoot.events.questionEnd)
    7. [finish](#kahoot.events.finish)
    8. [finishText](#kahoot.events.finishText)
    9. [2Step](#kahoot.events.2Step)
    10. [feedback](#kahoot.events.feedback)
    11. [invalidName](#kahoot.events.invalidName)
  2. [Methods](#kahoot.methods)
    1. [join](#kahoot.methods.join)
    2. [reconnect](#kahoot.methods.reconnect)
    3. [answerQuestion](#kahoot.methods.answerQuestion)
    4. [answer2Step](#kahoot.methods.answer2Step)
    5. [leave](#kahoot.methods.leave)
    6. [sendFeedback](#kahoot.methods.sendFeedback)
  3. [Properties](#kahoot.properties)
    1. [~~sendingAnswer~~](#kahoot.properties.sendingAnswer)
    2. [token](#kahoot.properties.token)
    3. [sessionID](#kahoot.properties.sessionID)
    4. [name](#kahoot.properties.name)
    5. [quiz](#kahoot.properties.quiz)
    6. [nemesis](#kahoot.properties.nemesis)
    7. [nemeses](#kahoot.properties.nemeses)
    8. [totalScore](#kahoot.properties.totalScore)
    9. [cid](#kahoot.properties.cid)
    10. [team](#kahoot.properties.team)
3. [Quiz](#quiz)
  1. [Properties](#quiz.properties)
    1. [client](#quiz.properties.client)
    2. [name](#quiz.properties.name)
    3. [type](#quiz.properties.type)
    4. [currentQuestion](#quiz.properties.currentQuestion)
    5. [questions](#quiz.properties.questions)
    6. [questionCount](#quiz.properties.questionCount)
    7. [answerCounts](#quiz.properties.answerCounts)
4. [Question](#question)
  1. [Methods](#question.methods)
    1. [answer](#question.methods.answer)
  2. [Properties](#question.properties)
    1. [client](#question.properties.client)
    2. [quiz](#question.properties.quiz)
    3. [index](#question.properties.index)
    4. [timeLeft](#question.properties.timeLeft)
    5. [type](#question.properties.type)
    6. [~~usesStoryBlocks~~](#question.properties.usesStoryBlocks)
    7. [ended](#question.properties.ended)
    8. [number](#question.properties.number)
    9. [gamemode](#question.properties.gamemode)
5. [QuestionEndEvent](#questionendevent)
  1. [Properties](#questionendevent.properties)
    1. [client](#questionendevent.properties.client)
    2. [quiz](#questionendevent.properties.quiz)
    3. [question](#questionendevent.properties.question)
    4. [correctAnswer](#questionendevent.properties.correctAnswer)
    5. [correctAnswers](#questionendevent.properties.correctAnswers)
    6. [text](#questionendevent.properties.text)
    7. [correct](#questionendevent.properties.correct)
    8. [nemesis](#questionendevent.properties.nemesis)
    9. [points](#questionendevent.properties.points)
    10. [rank](#questionendevent.properties.rank)
    11. [total](#questionendevent.properties.total)
6. [QuestionSubmitEvent](#questionsubmitevent)
  1. [Properties](#questionsubmitevent.properties)
    1. [message](#questionsubmitevent.properties.message)
    2. [client](#questionsubmitevent.properties.client)
    3. [quiz](#questionsubmitevent.properties.quiz)
    4. [question](#questionsubmitevent.properties.question)
7. [Nemesis](#nemesis)
  1. [Properties](#nemesis.properties)
    1. [name](#nemesis.properties.name)
    2. [id](#nemesis.properties.id)
    3. [score](#nemesis.properties.score)
    4. [isKicked](#nemesis.properties.isKicked)
    5. [exists](#nemesis.properties.exists)
8. [FinishTextEvent](#finishtextevent)
  1. [Properties](#finishtextevent.properties)
    1. [firstMessage](#finishtextevent.properties.firstMessage)
    2. [secondMessage](#finishtextevent.properties.secondMessage)
    3. [messages](#finishtextevent.properties.messages)
    4. [metal](#finishtextevent.properties.metal)
9. [QuizFinishEvent](#quizfinishevent)
  1. [Properties](#quizfinishevent.properties)
    1. [client](#quizfinishevent.properties.client)
    2. [quiz](#quizfinishevent.properties.quiz)
    3. [players](#quizfinishevent.properties.player)
    4. [quizID](#quizfinishevent.properties.quizID)
    5. [rank](#quizfinishevent.properties.rank)
    6. [correct](#quizfinishevent.properties.correct)
    7. [incorrect](#quizfinishevent.properties.incorrect)

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
    - for type "open_ended," use a string to specify the answer.
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
