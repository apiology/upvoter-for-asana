/**
 * asana module.
 *
 * Contains functions useful to connect to the Asana API
 */

import Asana from 'asana';
import { platform } from './platform.js';

let fetchedClient: Asana.Client | null = null;

export const fetchClient = async () => {
  const config = platform().config();
  if (fetchedClient != null) {
    return fetchedClient;
  }
  const asanaAccessToken = await config.fetchAsanaAccessToken();

  const clientOptions: Asana.ClientOptions = {
    defaultHeaders: {
      'Asana-Enable': 'new_user_task_lists,new_project_templates,new_memberships,new_goal_memberships,new_goal_memberships',
    },
  };
  fetchedClient = Asana.Client.create(clientOptions).useAccessToken(asanaAccessToken);
  return fetchedClient;
};

export function findGid<T extends Asana.resources.Resource>(
  resourceList: Asana.resources.ResourceList<T>,
  isCorrectResource: (resource: T) => boolean
) {
  const logger = platform().logger();
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
        logger.log(`Found ${resource.gid}`);
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
  const c = platform();
  const config = c.config();
  const cache = c.cache();

  if (fetchedWorkspaceGid != null) {
    return fetchedWorkspaceGid;
  }
  fetchedWorkspaceGid = await cache.cacheFetch('workspaceGid', 'string');
  if (fetchedWorkspaceGid != null) {
    return fetchedWorkspaceGid;
  }
  const client = await fetchClient();
  const workspaces = await client.workspaces.getWorkspaces();
  const workspaceName = await config.fetchWorkspaceName();
  fetchedWorkspaceGid = await findGid(workspaces, (workspace) => workspace.name === workspaceName);
  if (fetchedWorkspaceGid == null) {
    throw new Error('Could not find workspace GID!');
  }
  cache.cacheStore('workspaceGid', fetchedWorkspaceGid);

  return fetchedWorkspaceGid;
};
