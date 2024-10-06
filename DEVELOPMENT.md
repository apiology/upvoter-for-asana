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
3. You should now see the workflow show up in Alfred's configuration.

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

## Releasing Alfred package

Related backlog tasks:

* Do npm Alfred release of cookiecutter-multicli projects in CircleCI (after other tests pass)

First, run these commands:

```sh
git stash && git checkout main && git pull && make
last_released_version=$(npm version --json | jq -r '."alfred-upvoter-for-asana"')
git log v${last_released_version:?}..
update_type= # patch/minor/major
npm version ${update_type:?}
git push
git push --tags
npm publish
alfy-cleanup
```

Now, remove your current installation from Alfred on your machine.

Then, install the newly published version via npm:

```sh
npm install --location=global alfred-upvoter-for-asana --upgrade
```

Verify the version installed matches what you just published:

```sh
npm list --location=global | grep alfred-upvoter-for-asana
```

Then, load Alfred | Preferences | Workflows |
Upvoter for Asana | right click | Export ... | (type
in version from CLI output) | Export | choose this directory | Export

Once done, make a GitHub release with the exported file (do this in a
new tab):

```sh
cd ../upvoter-for-asana
new_release=$(npm version --json | jq -r '."alfred-upvoter-for-asana"')
gh release create --generate-notes v${new_release:?} 'Upvoter for Asana.alfredworkflow'
```

Delete your current installation in Alfred again.

open 'Upvoter for Asana.alfredworkflow' | configure as prompted | Import

[packal](http://www.packal.org/) | Login if needed | Dashboard | Upvoter for Asana | Edit current | Workflow File | Remove | Choose File | (.alfredworkflow file) | Upload | Version | (update) | (scroll to bottom) | Submit

## Initial release to packal.org

1. Go through at least the screenshot generation steps of 'Initial
   release to Chrome Web Store'
1. Note down what the existing screenshots are, including the existing
   left and right sides of split screen images: `open
   docs/screenshot-*.png`
1. Plan out what additional screenshots you'd like to have in the
   gallery and what will be reused.
1. Generate 1280x800 (or scaled up) screenshots and save as
   `docs/screenshot-n-raw.png` and so on
1. Stage the screenshot raw files in git.
1. Add any annotations and save `docs/screenshot-n.paint` and so on.
   Open a similar `.paint` from a sibling project to copy and paste
   the annotation text to keep to the same style.
1. Stage the screenshot paint files in git.
1. File | Save As... | png | `docs/screenshot-n.png` (and so on) | Save
1. Image | Adjust Size... | Scale proportionally ☑ | Resample image ☑
   | Get to 1280x800 (or just under if ratio isn't right) | OK
1. Use adjust size to add transparent border until exactly as 1200x800
   (don't 'Scale proportionally' or 'Resample image' this time) | OK
1. Stage `screenshot-n.png` (and so on) in git.
1. Ensure `docs/screenshot-n.png` is scaled to 1280x800 with `file` command
1. Go to the [form](http://www.packal.org/node/add/alfred2-workflow)
1. Workflow Name: Upvoter for Asana
1. Version: (take latest version from package.json)
1. Bundle ID: cc.broz.asana.upvoter-for-asana
1. Short description: (take short description from README, drop
   mention of Alfred or Chrome Extension)
1. Icon: (upload static/chrome-extension/apiology-128x128.png) | Upload
1. Workflow file (upload latest release from GitHub) | Upload
1. Worfklow Description: select Text format | markdown | Copy the one
   sentence blurb entered above, then the usage instructions (you may
   need to merge the Chrome and Alfred instructions)
1. Alfred Forum Link | (leave empty for now)
1. Github URL: `https://github.com/apiology/upvoter-for-asana`
1. Categories: (fill in)
1. Tags: (fill in - e.g., asana)
1. Applications: (fill in - probably blank)
1. Webservices: (fill in - e.g. Asana)
1. Packal Documentation Page: Leave blank
1. Submit

## Releasing to Chrome Web Store

1. Update screenshots in `docs/` for any new features
1. Update [README.md](./README.md) with new screenshots
1. PR screenshot updates in
1. `git stash && git checkout main && git pull`
1. Bump the version in `static/chrome-extension/manifest.json` locally.
1. `git commit -m "Bump version" static/chrome-extension/manifest.json`
1. `git push && make clean && make`
1. Update [package.zip](./package.zip) in [developer dashboard](https://chrome.google.com/u/1/webstore/devconsole/d34ba2e8-8b5a-4417-889e-4047c35522d0) as `apiology-cws` user.
1. Upload any new screenshots
1. Update description to match current README.md - manually translate
   from markdown to text.
1. Save draft
1. ... | Preview
1. [Publish](https://developer.chrome.com/docs/webstore/update/)
