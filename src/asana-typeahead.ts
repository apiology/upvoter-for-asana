/**
 * asana-typeahead module.
 *
 * Contains functions useful to connect Asana typeahead feature with
 * chrome.omnibox API
 */

import * as Asana from 'asana';
import { platform } from './platform.js';
import { fetchClient, fetchWorkspaceGid } from './asana-base.js';

export const pullResult = async (text: string) => {
  const query: Asana.resources.Typeahead.TypeaheadParams = {
    resource_type: 'task',
    query: text,
    opt_pretty: true,
    opt_fields: ['name', 'completed', 'parent.name', 'custom_fields.gid', 'custom_fields.number_value', 'memberships.project.name'],
  };
  const workspaceGid = await fetchWorkspaceGid();
  const logger = platform().logger();

  logger.log('requesting typeahead with workspaceGid', workspaceGid,
    ' and query of ', query);
  logger.userVisibleStatus(`Searching for ${text}...`);

  // https://developers.asana.com/docs/typeahead
  const client = await fetchClient();
  return client.typeahead.typeaheadForWorkspace(workspaceGid, query);
};
