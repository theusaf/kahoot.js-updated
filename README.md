# About
This is the kahoot.js-updated browser library

## Usage:
Download and place either the minified or source script in your html file

Usage is very similar to the nodejs version of this with slight differences:
- You will almost certainly need to use proxies for the http requests
- This uses XMLHttpRequest, so certain behaviours will not work.

The script will expose the client class to `window.KahootClient`
