# Kahoot.js Documentation

## Classes

### Kahoot
Kahoot client that can interact with quizzes.

**Events**  
`on('ready')` and `on('joined')` - Emitted when the client joins the game.  
`on('quizStart', Quiz)` and `on('quiz', Quiz)` - Emitted when the quiz starts for the client. Passes a `Quiz` class.  
`on('question', Question)` - Emitted when the client receives a new question. This is NOT the same as the `questionStart` event, which is emitted after the question has started. Passes a `Question` class.  
`on('questionStart', Question)` - Emitted when a question starts. Passes a `Question` class.  
`on('questionSubmit', QuestionSubmitEvent)` - Emitted when your answer has been submitted. Passes a `QuestionSubmitEvent` class.  
`on('questionEnd', QuestionEndEvent)` - Emitted when a question ends. Passes a `QuestionEndEvent` class.  
`on('finish', QuizFinishEvent)` - Emitted when the quiz ends. Passes a `QuizFinishEvent` class.  
`on('finishText', FinishTextEvent)` - Emitted when the quiz finish text is sent. Passes a `FinishTextEvent` class.  
`on('quizEnd')` and `on('disconnect')` - Emitted when the quiz closes, and the client is disconnected.  
`on('2Step')` - Emitted when the 2 step authentification is sent to the client / refeshed  
`on('feedback')` - Emitted when the host requests to see feedback.  
`on('invalidName')` - Emitted when the name is a duplicate.

**Methods**  
`join(sessionID, playerName, teamNames)`  
Parameters:  
*sessionID (number)* - The Kahoot session ID to join.  
*playerName (string)* - The name of the user.  
*teamNames (array) [String]* - The names of the team members to be used in team game modes (optional).  
Returns: Promise  
`reconnect()`  
Should be used if connection is lost (network issue).  
Returns: undefined  
`answerQuestion(id)`  
Parameters:  
*id (number)* - The ID of the question to answer. (0 is the first answer, 1 is the second answer, etc.)  
Returns: Promise  
`answer2Step(steps)`  
Parameters:  
*steps (array)* - An array of the steps for the 2 step authentification. (numbers 0-3)  
Returns: Promise  
`leave()`  
Returns: Promise  
`sendFeedback(fun, learning, recommend, overall)`  
Parameters:  
*fun (number)* - A number to rate how much fun you had (1-5)  
*learning (number)* - A number to rate if you learned anything (1 or 0)  
*recommend (number)* - A number to rate if you would recommend (1 or 0)  
*overall (number)* - A number to rate how you felt (1-3) 1 = good, 3 = bad  
Returns: Promise

**Properties**  
`sendingAnswer (boolean)` - Whether or not the client is currently sending an answer.  
`token (String)` - The client token of the user.  
`sessionID (Number)` - The session ID of the quiz.  
`name (String)` - The user's name.  
`quiz (Quiz)` - The current quiz of the client.  
`nemesis (Nemesis)` - The client's nemesis. (Will be `null` if the client does not have a nemesis.)  
`nemeses (Nemesis Array)` - An array of all the client's past nemeses.  
`totalScore (Number)` - The client's accumulated score.  
`cid` - The client's client id.

### Quiz
**Properties**  
`client (Kahoot)` - The client the quiz is attached.  
`name (String)` - The name of the quiz. Note: this value may be "null" if you joined the quiz after it started  
`type (String)` - The quiz type.  
`currentQuestion (Question)` - The current question the quiz is on.  
`questions (Question Array)` - An array of every single question in the quiz. New questions get added as they come in.  
`questionCount (Number)` - The number of questions in the quiz.  
`answerCounts (Number Array)` - An array that shows the # of choices per question in the quiz.

### Question
**Methods**  
`answer(number)`  
Parameters:  
*number (Number)* - The question number to answer. (0 is the first answer, 1 is the second answer, etc.)

**Properties**  
`client (Kahoot)` - The client attached to the question.  
`quiz (Quiz)` - The quiz that the question for.  
`index (Number)` - The index of the question.  
`timeLeft (Number)` - The time left in the question.  
`type (String)` - The question type.  
`usesStoryBlocks (Boolean)` - Whether or not the question uses 'Story Blocks'.  
`ended (Boolean)` - Whether or not the question has ended.  
`number (Number)` - The number of the question.  
`gamemode (String)` - The game mode of the session. It can be either "classic" or "team."  
`team (Array) [String]` - The team member names.

### QuestionEndEvent
**Properties**  
`client (Kahoot)` - The client attached to the event.  
`quiz (Quiz)` - The quiz that the event is attached to.  
`question (Question)` - The question that the event is attached to.  
`correctAnswers (String Array)` - A list of the correct answers.  
`correctAnswer (String)` - The correct answer. (if there are multiple correct answers, this will be the first in the array.)  
`text (String)` - The text sent by Kahoot after a question has finished.  
`correct (Boolean)` - Whether or not the client got the question right.  
`nemesis (Nemesis)` - The client's nemesis. (Will be `null` if the client does not have a nemesis.)  
`points (Number)` - The points earned from this question.  
`rank (Number)` - The rank of the client  
`total (Number)` - The total score of the client

### QuestionSubmitEvent
**Properties**  
`message (String)` - The message sent by Kahoot after you sent in an answer.  
`client (Kahoot)` - The client attached to the event.  
`quiz (Quiz)` - The quiz attached to the event.  
`question (Question)` - The question attached to the event.

### Nemesis
**Properties**  
`name (String)` - The name of the nemesis user.  
`id (Number / String)` - The client ID of the user  
`score (Number)` - The score of the nemesis user.  
`isKicked (Boolean)` - Whether or not the nemesis user is kicked or not.  
`exists (Boolean)` - Whether or not the nemesis exists (All other values will be `undefined` if this is `false`)

### FinishTextEvent
**Properties**  
`firstMessage (String)` - The first finishing message sent by Kahoot.  
`secondMessage (String)` - The second message sent by Kahoot. (this property will be `undefined` if a second message was not sent.)  
`messages (String Array)` - An array of the messages sent.  
`metal (String)` - The medal recieved after the quiz.

### QuizFinishEvent
**Properties**  
`client (Kahoot)` - The client attached to the event.  
`quiz (Quiz)` - The quiz attached to the event.  
`players (Number)` - The number of players on the quiz.  
`quizID (String)` - The ID of the quiz.  
`rank (Number)` - The client's ranking on the quiz.  
`correct (Number)` - The number of questions that were scored correct.  
`incorrect (Number)` - The number of questions that were scored incorrect.
