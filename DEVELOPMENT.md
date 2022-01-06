# Development

## fix.sh

If you want to use rbenv/pyenv/etc to manage versions of tools,
there's a `fix.sh` script which may be what you'd like to install
dependencies.

## Overcommit

This project uses [overcommit](https://github.com/sds/overcommit) for
quality checks.  `bundle exec overcommit --install` will install it.

## direnv

This project uses direnv to manage environment variables used during
development.  See the `.envrc` file for detail.

## Releasing to Chrome Web Store

1. PR a bump to the version in `static/manifest.json`
1. `git checkout main && git pull`
1. `make clean && make`
1. Update [package.zip](./package.zip) in [developer dashboard](https://chrome.google.com/u/1/webstore/devconsole/d34ba2e8-8b5a-4417-889e-4047c35522d0) as `apiology-cws` user.
1. Update description to match current README.md - manually translate
   from markdown to text.
1. [Publish](https://developer.chrome.com/docs/webstore/update/)
1. Update options.html link in README.md

## Installing local version

1. Run 'make' to create the bundle with webpack, or 'make start' to
   start webpack in watch mode.
1. Go to [chrome://extensions/](chrome://extensions/)
1. Make sure 'Developer mode' is flipped on in the upper right.
1. Click the 'Load unpacked' button.
1. Choose the [dist](./dist) directory
