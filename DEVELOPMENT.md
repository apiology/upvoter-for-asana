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

## Run Chrome extension from local checkout

1. Run 'make' to create the bundle with webpack, or 'make start' to
   start webpack in watch mode.
2. Go to [chrome://extensions/](chrome://extensions/)
3. Make sure 'Developer mode' is flipped on in the upper right.
4. Click the 'Load unpacked' button.
5. Choose the [dist/chrome-extension](./dist/chrome-extension) directory

## Run Alfred workflow from local checkout

1. `make`
2. `yarn install`  (only needed once)
3. You should now see the worfklow show up in Alfred's configuration.

## Interactive development with Asana API

1. Save off the configured Asana client object in asana-base.ts#fetchClient():
   ```TypeScript
   const w: any = window;
   w.savedClient = fetchedClient;
  ```
2. Open up Extensions | Upvoter for Asana
3. Click reload icon
4. Invoke filer on something
5. Save off the client in the Chrome DevTools console before the background session expires:
   ```TypeScript
   client = savedClient;
   ```
6. You can now invoke the methods from [node-asana](https://github.com/Asana/node-asana/tree/master/lib/resources):
   ```TypeScript
   stories = await client.stories.getStoriesForTask('1234);
   ```

## Publishing Alfred package to npm

Related backlog tasks:

* Do npm Alfred release of cookiecutter-multicli projects in CircleCI (after other tests pass)

```sh
git checkout main
git pull
git stash
last_released_version=$(npm version --json | jq -r '."alfred-upvoter-for-asana"')
git log ${last_released_version:?}..
update_type= # patch/minor/major
npm version ${update_type:?}
git push
git push --tags
npm publish
alfy-cleanup
npm install -g alfred-upvoter-for-asana --upgrade
```

## Releasing to Chrome Web Store

1. Update screenshots in `docs/` for any new features
1. Update [README.md](./README.md) with new screenshots
1. PR screenshot updates in
1. PR a bump to the version in `static/chrome-extension/manifest.json`
1. `git checkout main && git pull`
1. `make clean && make`
1. Update [package.zip](./package.zip) in [developer dashboard](https://chrome.google.com/u/1/webstore/devconsole/d34ba2e8-8b5a-4417-889e-4047c35522d0) as `apiology-cws` user.
1. Upload any new screenshots
1. Update description to match current README.md - manually translate
   from markdown to text.
1. Save draft
1. ... | Preview
1. [Publish](https://developer.chrome.com/docs/webstore/update/)
1. Update options.html link in README.md
