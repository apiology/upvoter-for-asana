import { escapeHTML } from './omnibox';

export const logSuccess = (result: string | object): void => console.log('Upvoted task:', result);

export const pullOmniboxSuggestions = async (text: string) => [{
  content: `some input data for next step, maybe containing ${text}`,
  description: escapeHTML('some human readable text'),
}];

export const actOnInputData = (text: string) => {
  console.log(`Acting upon ${text}`);
  return 'a success message or status';
};
