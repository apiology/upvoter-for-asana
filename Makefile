.PHONY: clean test help quality
.DEFAULT_GOAL := default

define PRINT_HELP_PYSCRIPT
import re, sys

for line in sys.stdin:
	match = re.match(r'^([a-zA-Z_-]+):.*?## (.*)$$', line)
	if match:
		target, help = match.groups()
		print("%-20s %s" % (target, help))
endef
export PRINT_HELP_PYSCRIPT

help:
	@python -c "$$PRINT_HELP_PYSCRIPT" < $(MAKEFILE_LIST)

repl: ## Bring up an interactive JavaScript prompt
	@echo "const asana = require('asana');"
	@echo "const clientOptions = {"
	@echo "    defaultHeaders: {"
	@echo "      'Asana-Enable': 'new_user_task_lists,new_project_templates',"
	@echo "    },"
	@echo "};"
	@echo "const asanaAccessToken = process.env.ASANA_API_TOKEN;"
	@echo "const client = asana.Client.create(clientOptions).useAccessToken(asanaAccessToken);"
	@echo "const workspaceGid = (await client.workspaces.getWorkspaces()).data.find((workspace) => workspace.name == 'VB').gid;"
	@echo "const customField = (await client.customFields.findByWorkspace(workspaceGid)).data.find((customField) => customField.name == 'stars')"
	@echo "await client.tasks.getTask('123')"
	@echo "const user = (await client.users.findAll({workspace: workspaceGid})).data.find(user => user.name == 'Vince Broz');"
	@ASANA_API_TOKEN=$$(with-op op read 'op://private/Asana access token - upvoter-opener-filer chrome extensions/password') node

webpack: ## run webpack and tie together modules for use by browser
	npx webpack

chrome-extension-start: ## run webpack continuously and watch files
	npm run chrome-extension-start

alfred-start: ## run tsc continuously and watch files
	npm run alfred-start

build-alfy:
	npm run build-alfy

build-chrome-extension: webpack

build: build-alfy build-chrome-extension

default: build test package quality ## build, package up, test and check code quality for both Alfred and the Chrome Extension

package: package-chrome-extension

package-chrome-extension: build-chrome-extension
	cd dist/chrome-extension && zip -r ../../package.zip .

typecheck: webpack  ## typecheck by running webpack
	jsonschema --instance static/chrome-extension/manifest.json docs/chrome-manifest-v3-schema.json

requirements_dev.txt.installed: requirements_dev.txt
	pip install -q --disable-pip-version-check -r requirements_dev.txt
	touch requirements_dev.txt.installed

pip_install: requirements_dev.txt.installed ## Install Python dependencies

# bundle install doesn't get run here so that we can catch it below in
# fresh-checkout and fresh-rbenv cases
Gemfile.lock: Gemfile

# Ensure any Gemfile.lock changes ensure a bundle is installed.
Gemfile.lock.installed: Gemfile.lock
	bundle install
	touch Gemfile.lock.installed

bundle_install: Gemfile.lock.installed ## Install Ruby dependencies

clean: ## remove all built artifacts
	rm -fr package.zip dist/alfred/* dist/chrome-extension/* || true

test: ## run tests quickly
	npm test

overcommit: ## run precommit quality checks
	bundle exec overcommit --run

quality: overcommit ## run precommit quality checks

update_from_cookiecutter: ## Bring in changes from template project used to create this repo
	bundle exec overcommit --uninstall
	IN_COOKIECUTTER_PROJECT_UPGRADER=1 cookiecutter_project_upgrader || true
	git checkout cookiecutter-template && git push && git checkout main
	git checkout main && git pull && git checkout -b update-from-cookiecutter-$$(date +%Y-%m-%d-%H%M)
	git merge cookiecutter-template || true
	bundle exec overcommit --install
	@echo
	@echo "Please resolve any merge conflicts below and push up a PR with:"
	@echo
	@echo '   gh pr create --title "Update from cookiecutter" --body "Automated PR to update from cookiecutter boilerplate"'
	@echo
	@echo
