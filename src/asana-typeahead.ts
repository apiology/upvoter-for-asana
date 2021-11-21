import * as Asana from 'asana';
import { Gid } from './asana-types';
import { asanaAccessToken, workspaceName } from './config';
import { logError } from './error';
import { escapeHTML } from './omnibox';

export const client = Asana.Client.create().useAccessToken(asanaAccessToken);

export const findAndSaveWorkspaceGid = (
  workspacesResult: Asana.resources.ResourceList<Asana.resources.Workspaces.Type>
) => new Promise<string | null>((resolve, reject) => {
  // https://stackoverflow.com/questions/44013020/using-promises-with-streams-in-node-js
  const stream = workspacesResult.stream();
  stream.on('data', (workspace: Asana.resources.Workspaces.Type) => {
    if (workspace.name === workspaceName) {
      console.log(`Found workspace GID as ${workspace.gid}`);
      resolve(workspace.gid);
    }
  });
  stream.on('end', () => resolve(null));
  stream.on('finish', () => resolve(null));
  stream.on('error', () => reject());
});

export const workspaceGidFetch: Promise<Gid> = (async () => {
  const workspaces = await client.workspaces.getWorkspaces();
  const workspaceGid = await findAndSaveWorkspaceGid(workspaces);
  if (workspaceGid == null) {
    logError('Could not find workspace GID!');
  }

  return workspaceGid;
})();

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
  const workspaceGid = await workspaceGidFetch;

  console.log('requesting typeahead with workspaceGid', workspaceGid,
    ' and query of ', query);
  chrome.omnibox.setDefaultSuggestion({
    description: `<dim>Searching for ${text}...</dim>`,
  });

  // https://developers.asana.com/docs/typeahead
  const typeaheadResult = await client.typeahead.typeaheadForWorkspace(workspaceGid, query);

  return typeaheadResult;
};
