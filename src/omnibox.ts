/**
 * omnibox module.
 *
 * Contains functions useful to interact with chrome.omnibox API
 */

// How on God's green earth is there no built-in function to do this?
//
// https://stackoverflow.com/questions/40263803/native-javascript-or-es6-way-to-encode-and-decode-html-entities
export const escapeHTML = (str: string) => {
  const escape = (tag: string): string => {
    const s = ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }[tag]);
    if (s == null) {
      throw new Error('Error in regexp logic!');
    }
    return s;
  };
  return str.replace(/[&<>'"]/g, escape);
};

export default 'escapeHTML';
