/**
 * asana-typeahead module.
 *
 * Contains functions useful to connect Asana typeahead feature with
 * chrome.omnibox API
 */

import * as Asana from 'asana';
import { platform } from './platform.js';
import { fetchClient, fetchWorkspaceGid } from './asana-base.js';

export async function pullResult(text: string, resourceType: 'task', optFields: string):
  Promise<Asana.resources.ResourceList<Asana.resources.Tasks.Type>>;
export async function pullResult(text: string, resourceType: 'project', optFields: string):
  Promise<Asana.resources.ResourceList<Asana.resources.Projects.Type>>;
export async function pullResult(text: string, resourceType: 'custom_field', optFields: string):
  Promise<Asana.resources.ResourceList<Asana.resources.CustomFields.Type>>;
export async function pullResult(text: string, resourceType: 'project', optFields: string):
  Promise<Asana.resources.ResourceList<Asana.resources.Projects.Type>>;
// export async function pullResult(text: string, resourceType: 'portfolio', optFields: string):
//  Promise<Asana.resources.ResourceList<Asana.resources.Portfolios.Type>>;
export async function pullResult(text: string, resourceType: 'tag', optFields: string):
  Promise<Asana.resources.ResourceList<Asana.resources.Tags.Type>>;
export async function pullResult(text: string, resourceType: string, optFields: string):
  Promise<Asana.resources.ResourceList<Asana.resources.Resource>> {
  const query: Asana.resources.Typeahead.TypeaheadParams = {
    resource_type: resourceType,
    query: text,
    opt_pretty: true,
    opt_fields: optFields,
  };
  const workspaceGid = await fetchWorkspaceGid();
  const logger = platform().logger();

  logger.debug(
    'requesting typeahead with workspaceGid',
    workspaceGid,
    ' and query of ',
    query
  );
  logger.userVisibleStatus(`Searching for ${text}...`);

  // https://developers.asana.com/docs/typeahead
  const client = await fetchClient();
  return client.typeahead.typeaheadForWorkspace(workspaceGid, query);
}
