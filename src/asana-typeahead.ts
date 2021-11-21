import * as Asana from 'asana';
import { Gid } from './asana-types';
import { asanaAccessToken, workspaceName } from './config';
import { logError } from './error';

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
