#!/bin/bash -eu
# alfy-init requires Alfred.app; skip on CI/Linux and when Alfred is not installed.
if [ -f "${HOME}/Library/Application Support/Alfred/prefs.json" ]; then
  alfy-init
fi
