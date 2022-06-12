# Upvoter for Asana

[![CircleCI](https://circleci.com/gh/apiology/upvoter-for-asana.svg?style=svg)](https://circleci.com/gh/apiology/upvoter-for-asana)

WARNING: This is not ready for use yet!

Quickly finds and increments integer custom fields in Asana tasks from the Chrome Omnibox or as an Alfred workflow.

## Using Chrome Extension

Go to the URL bar ("Chrome Omnibox"), then type 'uv', a space, then...

## Using Alfred Workflow

Similarly, activate Alfred, then type 'uv', a space, then...

## Installing Chrome Extension

This isn't in the Chrome App Store - see [DEVELOPMENT.md](./DEVELOPMENT.md) for how to run from a local checkout.

## Installing Alfred workflow

The Alfred package isn't published yet - see [DEVELOPMENT.md](./DEVELOPMENT.md) for how to run from a local checkout.

## Chrome Extension Configuration

1. Create a new "Personal access token" in
   [Asana](https://app.asana.com/0/my-apps)
1. Set up options directly
   [here](chrome-extension://TBD/options.html)
   or in Chrome | … | More Tools | Extensions | Upvoter for Asana |
   Details | Extension options.
1. Paste in your personal access token.
1. Provide the rest of the configuration and hit 'Save'

## Alfred Workflow Configuration

1. Create a new "Personal access token" in
   [Asana](https://app.asana.com/0/my-apps)
1. Alfred | Workflows | Upvoter for Asana | [≈] icon in upper right
1. Add values to Workflow Environment Variables section
1. Save

## Legal

Not created, maintained, reviewed, approved, or endorsed by Asana, Inc.

## Contributions

This project, as with all others, rests on the shoulders of a broad
ecosystem supported by many volunteers doing thankless work, along
with specific contributors.

In particular I'd like to call out:

* [Audrey Roy Greenfeld](https://github.com/audreyfeldroy) for the
  cookiecutter tool and associated examples, which keep my many
  projects building with shared boilerplate with a minimum of fuss.
