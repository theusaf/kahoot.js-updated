# kahoot.js-updated V2.x.x Documentation
Looking for documentation for V1.x.x? See [Documentation-Old](Documentation-Old.md).

**Note: The API from V1 has changed in various ways. Check the new docs before upgrading.**

See [what's new.](#whats-new)

[JSDoc](https://theusaf.github.io/kahoot.js-updated)umentation

- [Examples](#examples)
- [Methods](#methods)
- [Events](#events)
- [Properties](#properties)

## Documentation

<a name="examples"></a>
## Examples
<a name="basic"></a>
### Basic Usage
```js
const Kahoot = require("kahoot.js-updated");
const client = new Kahoot;
client.join(PIN).catch(err=>{
  console.log("Failed to join: " + err.description || err.status);
});
client.on("Joined",()=>{console.log("Joined!")});
client.on("Disconnect",(reason)=>{console.log("Disconnected: " + reason)});
client.on("QuizStart",(question)=>{question.answer(0)});
```

<a name="custom-modules"></a>
### Custom Modules
```js
const disabled = new Kahoot({
  modules: {
  	extraData: false,
    feedback: false,
    teamAccept: false
  }
});
disabled.join(PIN);
disabled.on("QuestionStart",(question)=>{
  try{
    question.answer(0);
  }catch(err){ // question.answer is not a function
               // (enabled in extraDark, which was disabled)
    disabled.answer(0); // works!
  }
});
disabled.on("TeamAccept",(info)=>{
  console.log(info); // This should not run (teamAccept is disabled)
});
```

<a name="methods"></a>
### Methods

<a name="methods.static.defaults"></a>
**`static` `defaults(options)`** - Creates a new Client class using new default options.
| Parameter | Returns |
| - | - |
| [options](https://theusaf.github.io/kahoot.js-updated/Client_defaults.html) | Client |

<a name="methods.static.join"></a>
**`static` `join(pin,name,team)`** - Creates a new client and joins the game.
#### Parameters:
| name | description |
|-|-|
|pin|The game pin of the Kahoot! game/challenge|
|*name*|The name of the client.|
|*team*|The team members (used in team mode). If left empty, defaults to `"Player 1","Player 2","Player 3","Player 4"`|
#### Returns `Object`

|property|description|
|-|-|
|client|The newly created client|
|event|The [join](#methods.join) promise|

Equivalent of doing:
```
var client = new Kahoot;
client.join(pin,name,team);
```

<a name="methods.join"></a>
**join(pin,name,team)** - Join a Kahoot! game or challenge.
#### Parameters:
|name|description|
|-|-|
|pin|The game pin of the Kahoot! game/challenge|
|*name*|The name of the player|
|*team*|The team members of the player. Defaults to `"Player 1","Player 2","Player 3","Player 4"`|
#### Returns `Promise`
- Resolves when the player joins the game (including team members)
  - If two step join is enabled, this does not mean that the client is fully connected yet.
- Rejects with an [error object](https://kahoot.js.org/#/enum/LiveEventJoinResponse) if joining fails.
  - If the game is `LOCKED`, it will reject with a [status object](https://kahoot.js.org/#/enum/LiveEventStatus) instead
  - There is a chance that this may neither resolve nor reject if Kahoot! for some reason decides to ignore your login request (usually due to a suspicious name).
  - If the error is not due to a duplicate name, the client will disconnect from the socket.

<a name="methods.answer"></a>
**answer(choice)** - Answers the question
#### Parameters:
- `choice` - A `Number`, `String`, or `Array<Number>` representing the client's answer to a question.
  - The answer is automatically reformatted if invalid input is provided based on the question type.
#### Returns: `Promise`
- Resolves when the answer is received by Kahoot!
- Rejects if the message fails to be received within 10 seconds. <sup>[4](#footnote-4)</sup>

<a name="methods.answerTwoFactorAuth"></a>
**answerTwoFactorAuth(steps)** - Answers the two-step code.
#### Parameters:
- `code` - A list of the following numbers: `0,1,2,3` (red,blue,yellow,green). The numbers represent the code order on the host's screen.
#### Returns `Promise`
- Resolves when the message is received by Kahoot!
- Rejects if the message times out <sup>[4](#footnote-4)</sup>

<a name="methods.joinTeam"></a>
**joinTeam(team)** - Send the team members
- This should be used if you specify `false` for *`team`* in [join](#methods.join).
  - specifying `false` for the team disables sending the team immediately.
#### Parameters:
- *`team`* - A list of strings representing the names of team members. Defaults to `"Player 1","Player 2","Player 3","Player 4"`
#### Returns `Promise`
- Resolves when received by Kahoot!
- Rejects if the message times out <sup>[4](#footnote-4)</sup>

<a name="methods.leave"></a>
**leave()** - Leaves the game.
- Disconnects from the game and closes the socket.

<a name="methods.next"></a>
**next()**<sup>[5](#footnote-5)</sup> - Continues to the next event.
- This is run automatically if `defaults.options.ChallengeAutoContinue` is `true` (which it is by default)

<a name="methods.reconnect"></a>
**reconnect(cid)** - Reconnect to a game
#### Parameters:
- *`cid`* - If creating a new client to reconnect, you can specify a cid to rejoin the game.
  - You can call this without `cid` if the socket disconnected for an unknown reason.
#### Returns `Promise`
- Resolves when the client reconnects to the game
- Rejects if the client fails to reconnect

<a name="methods.sendFeedback"></a>
**sendFeedback(fun,learn,recommend,overall)** - Sends feedback to the host.
#### Parameters
- `fun` - A number from 1 to 5, rating the quiz
- `learn` - A number from 0 to 1, specifying if you learnt anything
- `recommend` - A number from 0 to 1, specifying if you would recommend the quiz
- `overall` - A number from -1 to 1, rating the overall feeling of the game.
#### Returns `Promise`
- Resolves when the feedback is received by Kahoot!
- Rejects if the message times out <sup>[4](#footnote-4)</sup>

### Events
<a name="events.Disconnect"></a>
`Disconnect` => `String`
- Emitted when the client is disconnected
  - Returns a String with the reason why the client was disconnected.

<a name="events.Feedback"></a>
`Feedback`
- Emitted when the host asks for feedback

<a name="events.GameReset"></a>
`GameReset`
- Emitted when the game resets back to the lobby

<a name="events.Joined"></a>
`Joined` => `Object`
- Emitted when the client joins the game
  - Returns an object with the [settings](https://theusaf.github.io/kahoot.js-updated/Client.html#event:Joined) of the game
  - May not necessarily mean that the client is fully connected.
    - If two-step join is enabled, the client will have to answer the two-step challenge before being fully connected.

<a name="events.NameAccept"></a>
`NameAccept` => `Object`
- Emitted when Kahoot! has validated the client's name.
  - Returns an object including the player's name (may be changed if deemed inappropriate)
    - `playerName` - The player name
    - `quizType` - String (`quiz`)
    - `playerV2` - Boolean (`true`)
    - `hostPrimaryUsage` - The host account's primary usage

<a name="events.Podium"></a>
`Podium` => `Object`
- Emitted when the quiz has ended. (After [`QuizEnd`](#events.QuizEnd))
  - Returns an object containing the medal.
    - `podiumMedalType` - The medal.

<a name="events.QuestionEnd"></a>
`QuestionEnd` => `Object`
- Emitted when the question ends.
  - Returns an [object](https://theusaf.github.io/kahoot.js-updated/Client.html#event:QuestionEnd) with information about the client's score and answer.

<a name="events.QuestionReady"></a>
`QuestionReady` => `Object`
- Emitted when the question is about to start
  - Returns an [object](https://theusaf.github.io/kahoot.js-updated/Client.html#event:QuestionReady) with information about the upcoming question and the time remaining before it starts.

<a name="events.QuestionStart"></a>
`QuestionStart` => `Object`
- Emitted when the question starts.
  - Returns an [object](https://theusaf.github.io/kahoot.js-updated/Client.html#event:QuestionStart) with information about the question and the time remaining in the question.
  - The client may now answer the question.
  - The object also contains an [`answer`](#methods.answer) method, which can be used to answer the question. <sup>[1](#footnote-1)</sup>

<a name="events.QuizEnd"></a>
`QuizEnd` => `Object`
- Emitted when the quiz ends.
  - Returns an [object](https://theusaf.github.io/kahoot.js-updated/Client.html#event:QuizEnd) about the ranking and scores of the client.

<a name="events.QuizStart"></a>
`QuizStart` => `Object`
- Emitted when the quiz starts.
  - Returns an object that contains some information about the quiz.
    - `quizType` - String (`quiz`)
    - `quizQuestionAnswers` - A list of numbers signifying the number of choices in each question.

<a name="events.RecoveryData"></a>
`RecoveryData` => `Object`
- Emitted when the "recovery data" is sent from the server to the client.
  - This event is not particularly useful. The function running this event also calls other events based on the recovery data content.
    - These events are useful when joining a game late.
    - See [LiveEventRecoveryData](https://kahoot.js.org/#/enum/LiveEventRecoveryData).

<a name="events.TeamAccept"></a>
`TeamAccept` => `Object`
- Emitted when the team member's names have been validated by Kahoot!
  - Returns an object containing recovery data and the validated team members.
    - `memberNames` - A list of the team names. May be modified if the names included an inappropriate word.
    - `recoveryData` - [Recovery data](https://kahoot.js.org/#/enum/LiveEventRecoveryData )

<a name="events.TeamTalk"></a>
`TeamTalk` => `Object`
- Emitted when the team talk starts in team mode.
  - Returns an [object](https://theusaf.github.io/kahoot.js-updated/Client.html#event:TeamTalk) describing the time remaining and the upcoming question.
  - Unintended ability? You can answer the question during team talk (if the host is using the official host website)

<a name="events.TimeOver"></a>
`TimeOver` => `Object`
- Emitted when the question ends (before [QuestionEnd](#events.QuestionEnd)).
  - Returns an object.
    - `questionIndex` - The question index of the recently ended question.

<a name="events.TwoFactorCorrect"></a>
`TwoFactorCorrect`
- Emitted when the two-step challenge was completed successfully.
  - TwoFactor events will stop being emitted after this.

<a name="events.TwoFactorReset"></a>
`TwoFactorReset`
- Emitted when the two-step challenge code resets.

<a name="events.TwoFactorWrong"></a>
`TwoFactorWrong`
- Emitted when the two-step challenge was answered incorrectly.

<a name="whats-new"></a>
## What's New in Version 2?

### Control what events and functions are used in each client.
When creating the client, you may pass options to [disable certain "modules."](#custom-modules) This can be used to create a fast, memory-efficient client by removing excess events, methods, and properties that won't be used by the client. All modules are enabled by default.

### Property removal/rename
- Some properties from version 1 are no longer stored:
  - token
  - nemesis
  - nemeses
  - team
  - sendingAnswer
- Renamed properties
  - sessionID => gameid
  - gamemode => settings.gameMode
  - usesNamerator => settings.namerator
  - hasTwoFactorAuth => settings.twoFactorAuth
  - totalScore => data.totalScore <sup>[1](#footnote-1)</sup>
- New properties
  - data.streak <sup>[1](#footnote-1)</sup>

**Why?**

Many of these properties can be accessed through the events and have no real purpose besides being read-only data with no effect on the program (The properties are not used by the program). This should reduce the amount of memory used by each client.

Also, I am trying to match my code to [kahoot.js.org](https://kahoot.js.org), so that it is easier to find changes and fix any broken code.

The properties such as `name`, `cid`, `totalScore`, `quiz`, etc will be kept because they are a bit more useful to users.

### Proxies
Proxies can now be applied to the websockets as well as any http requests. However the proxies are now functions that return Objects specifying options for each connection.

~Proxies may also return an [HTTP(S).ClientRequest](https://nodejs.org/api/http.html#http_class_http_clientrequest) or a Promise that resolves with an ClientRequest.~ (Removed in 2.3.0)

For the `wsproxy`, it should return an Object of `ws` options or return a websocket itself. The websocket should be an `EventEmitter` with the following:
- A `message` event
- An `error` event
- A `close` event
- An `open` event
- A `close` method
- A `send` method
- A `readyState` property

The best way to do this would be to create a websocket using the [`ws`](https://www.npmjs.com/package/ws) module or something similar.

### Events
Some events have been removed, and many events have been renamed. There are a few new events as well:
- Removed:
  - `questionSubmit`
  - `invalidName`
  - `locked`
- Renamed:
  - `ready` `joined` => `Joined`
  - `quizStart` `quiz` => `QuizStart`
  - `question` => `QuestionReady`
  - `questionStart` => `QuestionStart`
  - `questionEnd` => `QuestionEnd`
  - `finish` => `QuizEnd`
  - `finishText` => `Podium`
  - `quizEnd` `disconnect` => `Disconnect`
  - `2Step` => `TwoFactorReset`
  - `2StepFail` => `TwoFactorWrong`
  - `2StepSuccess` => `TwoFactorCorrect`
  - `feedback` => `Feedback`
  - `handshakeFailed` => `HandshakeFailed` <sup>[2](#footnote-2)</sup>
- Added:
  - `TimeOver`
  - `TeamTalk`
  - `TeamAccept`
  - `NameAccept`
  - `GameReset`
  - `RecoveryData` <sup>[3](#footnote-3)</sup>

These events should be easier to understand for developers. Most removed events are now part of the asynchronous methods or have been removed because they are not actual events from Kahoot!'s API.

### Methods
There are a few changes to methods, as well as new ones.
- Renamed:
  - `answerQuestion` => `answer`
  - `answer2Step` => `answerTwoFactorAuth`
- Added:
  - `join` (static)
  - `defaults`(static)
  - `joinTeam`

Read the [full documentation](https://theusaf.github.io/kahoot.js-updated) for a detailed explanation of each method and event.

### Challenges
There are a few changes to how kahoot.js-updated handles challenges:
- Not possible to "rejoin" a challenge. (The cid was removed from the challenge response)
- Better error handling and answer checking/scores.
- For custom scores, value is now hard coded to be limited between [0,1500]

Challenges are not affected by disabled modules. (If fact, it's probably better to disable them for challenges)

### Improvements
- A shorter way to join:
  ```js
  const Kahoot = require("kahoot.js-updated");
  const {client,event} = Kahoot.join(pin);
  event.then(()=>{
    console.log("Joined!");
  }).catch((err)=>{
    console.log("Error! " + JSON.stringify(err));
  });
  ```
- Most methods now return a `Promise` that resolves when received by Kahoot's server and rejects if not received within 10 seconds.
- More in-built timers to prevent packet loss.

**Footnotes**

1. <a name="footnote-1">Enabled when the module `extraData` is enabled.</a>
2. <a name="footnote-2">This event should not be used. Instead, catch the promise rejection from the `join` or `reconnect` methods.</a>
3. <a name="footnote-3">The client does not need to listen to this event. This event is used internally to emit other events.</a>
4. <a name="footnote-4">Basically, this assumes that the packet was lost.</a>
5. <a name="footnote-5">For use in Challenges</a>

---

© theusaf 2020

---

**Disclaimer:**

Kahoot.JS-Updated is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Kahoot! AS.
