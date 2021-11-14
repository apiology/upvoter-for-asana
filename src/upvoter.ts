import * as Asana from 'asana';
import { Gid } from './asana-types.ts';
import { SuggestFunction } from './chrome-types.ts';
import {
  asanaAccessToken, customFieldName, increment, workspaceName,
} from './config.ts';

/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
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

      // https://developers.asana.com/docs/update-a-task
      // https://github.com/Asana/node-asana/blob/6bf00fb3257847744bf0ebe2dc0e95c445477282/lib/resources/gen/tasks.js#L563-L578
      /**
       * Update a task
       * @param {String} taskGid: (required) The task to operate on.
       * @param {Object} data: Data for the request
       * @param {Object} [dispatchOptions]: Options, if any, to pass the dispatcher for the request
       * @return {Promise} The requested resource
       */
      updateTask(
        taskGid: string,
        data?: any,
        dispatchOptions?: any
      ): Promise<void>
    }

    interface CustomField extends Resource {
      enabled: boolean;
      enum_options: EnumValue[] | null;
      enum_value: EnumValue | null;
      number_value: number | null;
    }

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
      ): Promise<ResourceList<Tasks.Type>>
    }

    interface Workspaces extends Resource {
      // https://github.com/Asana/node-asana/blob/6bf00fb3257847744bf0ebe2dc0e95c445477282/lib/resources/gen/workspaces.js#L57-L74
      /**
       * Get multiple workspaces
       * @param {Object} params: Parameters for the request
       - offset {String}:  Offset token. An offset to the next page returned by the API. A pagination request will return an offset token, which can be used as an input parameter to the next request. If an offset is not passed in, the API will return the first page of results. 'Note: You can only pass in an offset that was returned to you via a previously paginated request.'
       - limit {Number}:  Results per page. The number of objects to return per page. The value must be between 1 and 100.
       - optFields {[String]}:  Defines fields to return. Some requests return *compact* representations of objects in order to conserve resources and complete the request more efficiently. Other times requests return more information than you may need. This option allows you to list the exact set of fields that the API should be sure to return for the objects. The field names should be provided as paths, described below. The id of included objects will always be returned, regardless of the field options.
       - optPretty {Boolean}:  Provides "pretty" output. Provides the response in a "pretty" format. In the case of JSON this means doing proper line breaking and indentation to make it readable. This will take extra time and increase the response size so it is advisable only to use this during debugging.
       * @param {Object} [dispatchOptions]: Options, if any, to pass the dispatcher for the request
       * @return {Promise} The requested resource
       */
      getWorkspaces(
        params?: any,
        dispatchOptions?: any
      ): Promise<ResourceList<Workspaces.Type>>
    }

    interface CustomFieldsStatic {
      /**
       * @param dispatcher
       */
      new(dispatcher: Dispatcher): CustomFields;
    }

    namespace CustomFields {
      interface Type extends Resource {
        readonly gid: string;
        // readonly created_at: string;
        // readonly download_url: string;
        // readonly view_url: string;
        // readonly name: string;
        // readonly host: string;
        // readonly parent: Resource;
      }
    }

    const CustomFields: CustomFieldsStatic;

    interface CustomFields extends Resource {
      // https://github.com/Asana/node-asana/blob/6bf00fb3257847744bf0ebe2dc0e95c445477282/lib/resources/gen/custom_fields.js#L91-L110
      /**
       * Get a workspace's custom fields
       * @param {String} workspaceGid: (required) Globally unique identifier for the workspace or organization.
       * @param {Object} params: Parameters for the request
       - offset {String}:  Offset token. An offset to the next page returned by the API. A pagination request will return an offset token, which can be used as an input parameter to the next request. If an offset is not passed in, the API will return the first page of results. 'Note: You can only pass in an offset that was returned to you via a previously paginated request.'
       - limit {Number}:  Results per page. The number of objects to return per page. The value must be between 1 and 100.
       - optFields {[String]}:  Defines fields to return. Some requests return *compact* representations of objects in order to conserve resources and complete the request more efficiently. Other times requests return more information than you may need. This option allows you to list the exact set of fields that the API should be sure to return for the objects. The field names should be provided as paths, described below. The id of included objects will always be returned, regardless of the field options.
       - optPretty {Boolean}:  Provides "pretty" output. Provides the response in a "pretty" format. In the case of JSON this means doing proper line breaking and indentation to make it readable. This will take extra time and increase the response size so it is advisable only to use this during debugging.
       * @param {Object} [dispatchOptions]: Options, if any, to pass the dispatcher for the request
       * @return {Promise} The requested resource
       */
      getCustomFieldsForWorkspace(
        workspaceGid: string,
        params?: any,
        dispatchOptions?: any
      ): Promise<ResourceList<CustomFields.Type>>
    }
  }

  interface Client {
    typeahead: resources.Typeahead;
    customFields: resources.CustomFields;
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
/* eslint-enable camelcase */
/* eslint-enable max-len */
/* eslint-enable no-use-before-define */

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

const findAndSaveCustomFieldGid = (
  customFieldsResult: Asana.resources.ResourceList<Asana.resources.CustomFields.Type>
) => new Promise<void>((resolve, reject) => {
  // https://stackoverflow.com/questions/44013020/using-promises-with-streams-in-node-js
  const stream = customFieldsResult.stream();
  stream.on('data', (customField: Asana.resources.CustomField) => saveCustomFieldGidIfRightName(customField, resolve));
  stream.on('end', () => resolve());
  stream.on('finish', () => resolve());
  stream.on('error', () => reject());
});

const saveWorkspaceAndCustomFieldGidsIfRightNames = (workspace: Asana.resources.Workspaces.Type,
  resolve: ((value: void | PromiseLike<void>) => void)) => {
  if (workspace.name === workspaceName) {
    workspaceGid = workspace.gid;
    console.log(`Found workspace GID as ${workspaceGid}`);
    resolve(client.customFields.getCustomFieldsForWorkspace(workspaceGid, {})
      .then(findAndSaveCustomFieldGid));
  }
};

const findAndSaveWorkspaceAndCustomFieldGids = (
  workspacesResult: Asana.resources.ResourceList<Asana.resources.Workspaces.Type>
) => new Promise<void>((resolve, reject) => {
  // https://stackoverflow.com/questions/44013020/using-promises-with-streams-in-node-js
  const stream = workspacesResult.stream();
  stream.on('data', (
    workspace: Asana.resources.Workspaces.Type
  ) => saveWorkspaceAndCustomFieldGidsIfRightNames(workspace, resolve));
  stream.on('end', () => resolve());
  stream.on('finish', () => resolve());
  stream.on('error', () => reject());
});

export const gidFetch = client.workspaces.getWorkspaces()
  .then(findAndSaveWorkspaceAndCustomFieldGids);

const logErrorOrig = (err: string): never => {
  alert(err);
  throw err;
};

// As of 4.4.4, TypeScript's control flow analysis is wonky with
// narrowing and functions that return never.  This is a workaround:
//
// https://github.com/microsoft/TypeScript/issues/36753
export const logError: (err: string) => never = logErrorOrig;

export const pullCustomFieldGid = (): Promise<Gid> => gidFetch.then(() => {
  if (customFieldGid == null) {
    logError('customFieldGid fetch failed!');
  }
  return customFieldGid;
});

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
      logError('Error in regexp logic!');
    }
    return s;
  };
  return str.replace(/[&<>'"]/g, escape);
};

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
      .then((
        typeaheadResult: Asana.resources.ResourceList<Asana.resources.Tasks.Type>
      ) => ({ suggest, typeaheadResult }));
  });
};

export const upvoteTask = (
  task: Asana.resources.Tasks.Type
): Promise<Asana.resources.Tasks.Type> => {
  console.log('upvoteTask got task', task);
  return pullCustomFieldGid().then((upvotesCustomFieldGid: Gid) => {
    const customField = task.custom_fields.find((field) => field.gid === upvotesCustomFieldGid);
    if (customField == null) {
      logError('Expected to find custom field on task!');
    }
    let currentValue = customField.number_value;
    if (currentValue == null) {
      currentValue = 1;
    }
    // https://developers.asana.com/docs/update-a-task
    const newValue: number = increment ? currentValue + 1 : currentValue - 1;
    const updatedCustomFields: { [index: string]: number } = {};
    updatedCustomFields[upvotesCustomFieldGid] = newValue;
    return client.tasks.updateTask(task.gid,
      { custom_fields: updatedCustomFields }).then(() => task);
  });
};

export const logSuccess = (result: string | object): void => console.log('Upvoted task:', result);

export const pullCustomFieldFn = (upvotesCustomFieldGid: Gid) => (task: Asana
  .resources.Tasks.Type) => {
  const customField = task.custom_fields.find((field) => field.gid === upvotesCustomFieldGid);

  return { task, customField };
};
