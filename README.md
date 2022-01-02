# Upvoter for Asana

[![CircleCI](https://circleci.com/gh/apiology/upvoter-for-asana.svg?style=svg)](https://circleci.com/gh/apiology/upvoter-for-asana)

Chrome extension which quickly finds and increments integer custom
fields in Asana tasks from the Chrome Omnibox.

This is useful if you're trying to track pain points in a backlog -
just throw a backlog feature task a quick upvote in real time as you
suffer through missing the feature, then go back later and take on the
most upvoted tasks!

Not created, maintained, reviewed, approved, or endorsed by Asana,
Inc.

## Using

Go to the URL bar ("Chrome Omnibox"), and type 'uv', a space, then
search for an Asana task.  You should see them pop up as suggestions.
Pick one, and your custom field will be uploaded!

Also, if you mark a task done which has dependent upvotable tasks, you
can click on the dependent task links to upvote those tasks.  See
[Shortcuts for Asana](https://github.com/apiology/shortcuts-for-asana)
for keyboard shortcuts to hit those links!

## Configuration

1. Create a new "Personal access token" in
   [Asana](https://app.asana.com/0/my-apps)
2. Set up options directly
   [here](chrome-extension://olnbepiojfjbimgfnfdalnpkfbaphjjc/options.html)
   or in Chrome | … | More Tools | Extensions | Upvoter for Asana |
   Details | Extension options.
3. Paste in your personal access token.
4. Provide the rest of the configuration and hit 'Save'

## Installing

This isn't in the Chrome App Store and doesn't have any cool config UI,
so welcome to the Chrome Extension development experience!

1. Run 'make' to create the bundle with webpack, or 'make start' to
   start webpack in watch mode.
1. Go to [chrome://extensions/](chrome://extensions/)
1. Make sure 'Developer mode' is flipped on in the upper right.
1. Click the 'Load unpacked' button.
1. Choose the [dist](./dist) directory
