/**
 * asana-typeahead module.
 *
 * Contains functions useful to connect Asana typeahead feature with
 * chrome.omnibox API
 */

import * as Asana from 'asana';
import { fetchAsanaAccessToken, fetchWorkspaceName } from './config';
import { chromeStorageSyncFetch, chromeStorageSyncStore } from './storage';
import { escapeHTML } from './omnibox';

let fetchedClient: Asana.Client | null = null;

export const fetchClient = async () => {
  if (fetchedClient != null) {
    return fetchedClient;
  }
  const asanaAccessToken = await fetchAsanaAccessToken();

  fetchedClient = Asana.Client.create().useAccessToken(asanaAccessToken);
  return fetchedClient;
};

export function findGid<T extends Asana.resources.Resource>(
  resourceList: Asana.resources.ResourceList<T>,
  isCorrectResource: (resource: T) => boolean
) {
  return new Promise<string | null>((resolve, reject) => {
    // If I had esnext.asynciterable in
    // tsconfig.json#compilerOptions.lib, and if node-asana's
    // BufferedReadableasy supported async iterators, I could do:
    //
    // for await (const customField of customFieldsResult.stream()) {
    //   if (saveCustomFieldGidIfRightName(customField)) {
    //     return;
    //   }
    // }
    //
    // as-is, that gives me this error from tsc: Type
    // 'ResourceStream<Type>' must have a '[Symbol.asyncIterator]()'
    // method that returnsan async
    // iterator. [2504]
    //
    // https://github.com/Asana/node-asana/blob/8db5f44ff9acb8df04317c5c4db0ac4a300ba8b0/lib/util/buffered_readable.js
    // https://stackoverflow.com/questions/44013020/using-promises-with-streams-in-node-js
    // https://stackoverflow.com/questions/47219503/how-do-async-iterators-work-error-ts2504-type-must-have-a-symbol-asynciterat
    const stream = resourceList.stream();
    stream.on('data', (resource: T): void => {
      if (isCorrectResource(resource)) {
        console.log(`Found ${resource.gid}`);
        resolve(resource.gid);
      }
    });
    stream.on('end', () => resolve(null));
    stream.on('finish', () => resolve(null));
    stream.on('error', () => reject());
  });
}

let fetchedWorkspaceGid: string | null = null;

export const fetchWorkspaceGid = async () => {
  if (fetchedWorkspaceGid != null) {
    return fetchedWorkspaceGid;
  }
  fetchedWorkspaceGid = await chromeStorageSyncFetch('workspaceGid', 'string');
  if (fetchedWorkspaceGid != null) {
    return fetchedWorkspaceGid;
  }
  const client = await fetchClient();
  const workspaces = await client.workspaces.getWorkspaces();
  const workspaceName = await fetchWorkspaceName();
  fetchedWorkspaceGid = await findGid(workspaces, (workspace) => workspace.name === workspaceName);
  if (fetchedWorkspaceGid == null) {
    throw new Error('Could not find workspace GID!');
  }
  chromeStorageSyncStore('workspaceGid', fetchedWorkspaceGid);

  return fetchedWorkspaceGid;
};

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
