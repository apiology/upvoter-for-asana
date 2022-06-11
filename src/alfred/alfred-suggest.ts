import alfy, { ScriptFilterItem } from 'alfy';
import { pullSuggestions } from '../upvoter.js';
import { isString } from '../types.js';
import AlfredPlatform from './alfred-platform.js';
import { setPlatform } from '../platform.js';

setPlatform(new AlfredPlatform());

const run = async () => {
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

run();
