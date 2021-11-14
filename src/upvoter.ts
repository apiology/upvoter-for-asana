import * as Asana from 'asana';
import { Gid } from './asana-types.ts';
import { SuggestFunction } from './chrome-types.ts';

/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable camelcase */
/* eslint-disable max-len */
// extends https://github.com/DefinitelyTyped/DefinitelyTyped/blob/01906126b2ced50d3119dc09aa64fbe5f4bb9ff2/types/asana/index.d.ts#L2857
declare module 'asana' {
  namespace resources {
    interface TypeaheadParams {
      resource_type: string;
      query?: string | undefined;
      count?: number | undefined;
    }

    interface Tasks extends Resource {
      // https://github.com/Asana/node-asana/blob/6bf00fb3257847744bf0ebe2dc0e95c445477282/lib/resources/gen/tasks.js#L245-L262
      /**
       * Get a task
       * @param {String} taskGid: (required) The task to operate on.
       * @param {Object} params: Parameters for the request
       - optFields {[String]}:  Defines fields to return. Some requests return *compact* representations of objects in order to conserve resources and complete the request more efficiently. Other times requests return more information than you may need. This option allows you to list the exact set of fields that the API should be sure to return for the objects. The field names should be provided as paths, described below. The id of included objects will always be returned, regardless of the field options.
       - optPretty {Boolean}:  Provides “pretty” output. Provides the response in a “pretty” format. In the case of JSON this means doing proper line breaking and indentation to make it readable. This will take extra time and increase the response size so it is advisable only to use this during debugging.
       * @param {Object} [dispatchOptions]: Options, if any, to pass the dispatcher for the request
       * @return {Promise} The requested resource
       */
      getTask(
        taskGid: string,
        params?: any,
        dispatchOptions?: any,
      ): Promise<Tasks.Type>;
    }

    interface CustomField extends Resource {
      enabled: boolean;
      enum_options: EnumValue[] | null;
      enum_value: EnumValue | null;
      number_value: number | null;
    }

    // https://developers.asana.com/docs/get-objects-via-typeahead
    type TypeaheadResults = ResourceList<Tasks.Type>

    interface Typeahead extends Resource {
      // https://github.com/Asana/node-asana/blob/6bf00fb3257847744bf0ebe2dc0e95c445477282/lib/resources/gen/typeahead.js#L19-L40
      /**
       * Get objects via typeahead
       * @param {String} workspaceGid: (required) Globally unique identifier for the workspace or organization.
       * @param {Object} params: Parameters for the request
           - resourceType {String}:  (required) The type of values the typeahead should return. You can choose from one of the following: `custom_field`, `project`, `portfolio`, `tag`, `task`, and `user`. Note that unlike in the names of endpoints, the types listed here are in singular form (e.g. `task`). Using multiple types is not yet supported.
           - type {String}:  *Deprecated: new integrations should prefer the resource_type field.*
           - query {String}:  The string that will be used to search for relevant objects. If an empty string is passed in, the API will currently return an empty result set.
           - count {Number}:  The number of results to return. The default is 20 if this parameter is omitted, with a minimum of 1 and a maximum of 100. If there are fewer results found than requested, all will be returned.
           - optFields {[String]}:  Defines fields to return. Some requests return *compact* representations of objects in order to conserve resources and complete the request more efficiently. Other times requests return more information than you may need. This option allows you to list the exact set of fields that the API should be sure to return for the objects. The field names should be provided as paths, described below. The id of included objects will always be returned, regardless of the field options.
           - optPretty {Boolean}:  Provides “pretty” output. Provides the response in a “pretty” format. In the case of JSON this means doing proper line breaking and indentation to make it readable. This will take extra time and increase the response size so it is advisable only to use this during debugging.
       * @param {Object} [dispatchOptions]: Options, if any, to pass the dispatcher for the request
       * @return {Promise} The requested resource
 */
      typeaheadForWorkspace(
        workspaceGid: string,
        params?: TypeaheadParams,
        dispatchOptions?: any
      ): Promise<TypeaheadResults>
    }
  }

  interface Client {
    typeahead: resources.Typeahead;
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
/* eslint-enable camelcase */
/* eslint-enable max-len */

export const client = Asana.Client.create().useAccessToken(asanaAccessToken);

let workspaceGid: Gid | null = null;

let customFieldGid: Gid | null = null;

const saveCustomFieldGidIfRightName = (customField: Asana.resources.CustomField,
  resolve: () => void) => {
  if (customField.name === customFieldName) {
    customFieldGid = customField.gid;
    console.log(`Found custom field GID as ${customFieldGid}`);
    resolve();
  }
};

const findAndSaveCustomFieldGid = (customFieldsResult) => new Promise((resolve, reject) => {
  // https://stackoverflow.com/questions/44013020/using-promises-with-streams-in-node-js
  const stream = customFieldsResult.stream();
  stream.on('data', (customField: Asana.resources.CustomField) => saveCustomFieldGidIfRightName(customField, resolve));
  stream.on('end', () => resolve());
  stream.on('finish', () => resolve());
  stream.on('error', () => reject());
});

const saveWorkspaceAndCustomFieldGidsIfRightNames = (workspace, resolve) => {
  if (workspace.name === workspaceName) {
    workspaceGid = workspace.gid;
    console.log(`Found workspace GID as ${workspaceGid}`);
    resolve(client.customFields.getCustomFieldsForWorkspace(workspaceGid, {})
      .then(findAndSaveCustomFieldGid));
  }
};

const findAndSaveWorkspaceAndCustomFieldGids = (workspacesResult) => new Promise((resolve,
  reject) => {
  // https://stackoverflow.com/questions/44013020/using-promises-with-streams-in-node-js
  const stream = workspacesResult.stream();
  stream.on('data',
    (workspace) => saveWorkspaceAndCustomFieldGidsIfRightNames(workspace, resolve));
  stream.on('end', () => resolve());
  stream.on('finish', () => resolve());
  stream.on('error', () => reject());
});

export const gidFetch = client.workspaces.getWorkspaces()
  .then(findAndSaveWorkspaceAndCustomFieldGids);

export const pullCustomFieldGid = () => gidFetch.then(() => customFieldGid);

// How on God's green earth is there no built-in function to do this?
//
// https://stackoverflow.com/questions/40263803/native-javascript-or-es6-way-to-encode-and-decode-html-entities
export const escapeHTML = (str: string) => str.replace(/[&<>'"]/g,
  (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[tag]));

class NotInitializedError extends Error { }

export const pullTypeaheadSuggestions = (text: string, suggest: SuggestFunction) => {
  const query = {
    resource_type: 'task',
    query: text,
    opt_pretty: true,
    opt_fields: ['name', 'completed', 'parent', 'custom_fields.gid', 'custom_fields.number_value'],
  };
  return gidFetch.then(() => {
    if (workspaceGid == null) {
      alert('NOT INITIALIZED!');
      throw new NotInitializedError();
    }

    // TODO: query should be typed
    console.log('requesting typeahead with workspaceGid', workspaceGid,
      ' and query of ', query);
    chrome.omnibox.setDefaultSuggestion({
      description: `<dim>Searching for ${text}...</dim>`,
    });

    // https://developers.asana.com/docs/typeahead
    return client.typeahead.typeaheadForWorkspace(workspaceGid, query)
      .then((typeaheadResult: Asana.resources.TypeaheadResults) => ({ suggest, typeaheadResult }));
  });
};

export const upvoteTask = (task: Asana.resources.Tasks.Type) => {
  console.log('upvoteTask got task', task);
  return pullCustomFieldGid().then((upvotesCustomFieldGid: Gid) => {
    const customField = task.custom_fields.find((field) => field.gid === upvotesCustomFieldGid);
    const currentValue = customField.number_value;
    // https://developers.asana.com/docs/update-a-task
    const newValue = increment ? currentValue + 1 : currentValue - 1;
    const updatedCustomFields = {};
    updatedCustomFields[customFieldGid] = newValue;
    return client.tasks.updateTask(task.gid,
      { custom_fields: updatedCustomFields });
  });
};

export const logSuccess = (result: string) => console.log('Upvoted task:', result);

export const pullCustomFieldFn = (upvotesCustomFieldGid: Gid) => (task: Asana
  .resources.Tasks.Type) => {
  const customField = task.custom_fields.find((field) => field.gid === upvotesCustomFieldGid);

  return { task, customField };
};
