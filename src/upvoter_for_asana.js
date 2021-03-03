// How on God's green earth is there no built-in function to do this?
//
// https://stackoverflow.com/questions/40263803/native-javascript-or-es6-way-to-encode-and-decode-html-entities
const escapeHTML = (str) => str.replace(/[&<>'"]/g,
  (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[tag]));

const pullSuggestions = (text) => [{
  content: `some input data for next step, maybe containing ${text}`,
  description: escapeHTML('some human readable text'),
}];

const actOnInputData = (text) => {
  console.log(`Acting upon ${text}`);
};

module.exports = {
  pullSuggestions,
  actOnInputData,
};
