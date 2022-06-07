/**
 * asana-typeahead module.
 *
 * Contains functions useful to connect Asana typeahead feature with
 * chrome.omnibox API
 */

import * as Asana from 'asana';
import { escapeHTML } from './omnibox.js';
import { fetchClient, fetchWorkspaceGid } from './asana-base.js';

export const formatTask = (task: Asana.resources.Tasks.Type) => {
  const project = task.memberships[0]?.project;

  let membership = '';

  if (task.parent != null) {
    membership += ` / ${escapeHTML(task.parent.name)}`;
  }
  if (project != null) {
    membership += ` <dim>${project.name}</dim>`;
  }

  return `${escapeHTML(task.name)}${membership}`;
};

export const pullResult = async (text: string) => {
  const query: Asana.resources.Typeahead.TypeaheadParams = {
    resource_type: 'task',
    query: text,
    opt_pretty: true,
    opt_fields: ['name', 'completed', 'parent.name', 'custom_fields.gid', 'custom_fields.number_value', 'memberships.project.name'],
  };
  const workspaceGid = await fetchWorkspaceGid();

  console.log('requesting typeahead with workspaceGid', workspaceGid,
    ' and query of ', query);
  chrome.omnibox.setDefaultSuggestion({
    description: `<dim>Searching for ${text}...</dim>`,
  });

  // https://developers.asana.com/docs/typeahead
  const client = await fetchClient();
  return client.typeahead.typeaheadForWorkspace(workspaceGid, query);
};
