# End of service
kahoot.js-updated was taken down on Feb 18, 2021.

# About
Kahoot.js was a library to interact with the Kahoot API. kahoot.js supports joining and interacting with quizzes and challenges.
**Installation requires Node.js 10.9.0 or higher.**

![NPM](https://nodei.co/npm/kahoot.js-updated.png)

![Dependencies](https://david-dm.org/theusaf/kahoot.js-updated.svg) [![Known Vulnerabilities](https://snyk.io/test/github/theusaf/kahoot.js-updated/badge.svg)](https://snyk.io/test/github/theusaf/kahoot.js-updated) [![HitCount](https://hits.dwyl.com/theusaf/kahoot.js-updated.svg)](https://hits.dwyl.com/theusaf/kahoot.js-updated) ![Builds](https://travis-ci.com/theusaf/kahoot.js-updated.svg?branch=master) ![Docs](https://inch-ci.org/github/theusaf/kahoot.js-updated.svg?branch=master)

**Note: If upgrading from version 1.x.x, read the latest documentation for the new api first.**

# Basic Example
```js
const Kahoot = require("kahoot.js-updated");
const client = new Kahoot();
console.log("Joining kahoot...");
client.join(9802345 /* Or any other kahoot game pin */, "kahoot.js");
client.on("Joined", () => {
  console.log("I joined the Kahoot!");
});
client.on("QuizStart", () => {
  console.log("The quiz has started!");
});
client.on("QuestionStart", question => {
  console.log("A new question has started, answering the first answer.");
  question.answer(0);
});
client.on("QuizEnd", () => {
  console.log("The quiz has ended.");
});
```

## Full API Documentation
See [Documentation.md](Documentation.md).

## Examples
See `examples/` and `tests/`.
