import * as Asana from 'asana';
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

export class ChromeExtensionFormatter {
  formatTask = (task: Asana.resources.Tasks.Type) => {
    if (task.memberships == null) {
      throw new Error('Memberships required to format!');
    }
    const project = task.memberships[0]?.project;

    let membership = '';

    if (task.parent != null) {
      if (task.parent.name == null) {
        throw new Error('Task parent name required to format!');
      }
      membership += ` / ${escapeHTML(task.parent.name)}`;
    }
    if (project != null) {
      membership += ` <dim>${project.name}</dim>`;
    }

    if (task.name == null) {
      throw new Error('Task name required to format!');
    }
    return `${escapeHTML(task.name)}${membership}`;
  };

  escapeDescriptionPlainText = escapeHTML;
}
