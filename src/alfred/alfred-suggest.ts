import alfy, { ScriptFilterItem } from 'alfy';
import { hookStderr } from 'hook-std';
import { pullSuggestions } from '../upvoter-for-asana.js';
import { isString } from '../types.js';
import { AlfredPlatform } from './alfred-platform.js';
import { setPlatform } from '../platform.js';

const p = new AlfredPlatform();
setPlatform(p);

const run = async () => {
  await p.config().validate();

  let items: ScriptFilterItem[];
  try {
    const suggestions = await pullSuggestions(alfy.input);
    items = suggestions.map((suggestion): ScriptFilterItem => ({
      title: suggestion.description,
      subtitle: 'Upvoter for Asana',
      arg: suggestion.url,
    }));
    alfy.output(items);
  } catch (error) {
    if (error instanceof Error || isString(error)) {
      alfy.error(error);
    } else {
      throw error;
    }
  }
};

/* istanbul ignore next */
if (typeof jest === 'undefined') {
  // node-asana sends API deprecation warnings, which may start to
  // appear at any random time in the future, to stderr.  These are
  // warning messages, not errors.
  //
  // alfy sends them to Alfred.
  //
  // Alfred 4 does not react well when receiving this log and then
  // subsequently receiving the requested results, which effectively
  // turns them into mysterious failures that don't show either the
  // error messages or the results.
  //
  // Boo.
  //
  // https://github.com/sindresorhus/alfy/issues/160
  hookStderr({ silent: true }, () => undefined);
  run();
}
