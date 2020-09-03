# Kahoot.js V2.x.x Documentation
Looking for documentation for V1.x.x? See [Documentation-Old](Documentation-Old.md).

**Note: The API from V1 has changed in various ways. Check the new docs before upgrading.**

See [what's new.](#whats-new)

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

---

© theusaf 2020

---

**Disclaimer:**

Kahoot.JS-Updated is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Kahoot! AB.
