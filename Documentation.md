# Kahoot.js V2.x.x Documentation
Looking for documentation for V1.x.x? See [Documentation-Old](Documentation-Old.md).

**Note: The API from V1 has changed in various ways. Check the new docs before upgrading.**

See [what's new.](#whats-new)

<a name="whats-new"></a>
## What's New in Version 2?
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

**Why?**

Many of these properties can be accessed through the events and have no real purpose besides being read-only data with no effect on the program (The properties are not used by the program). This should reduce the amount of memory used by each client.

Also, I am trying to match my code to [kahoot.js.org](https://kahoot.js.org), so that it is easier to find changes and fix any broken code.

The properties such as `name`, `cid`, `totalScore`, `quiz`, etc will be kept because they are a bit more useful to users.

### Proxies
Proxies can now be applied to the websockets as well as any http requests. However the proxies are now functions that return Objects specifying options for each connection.

---

© theusaf 2020
