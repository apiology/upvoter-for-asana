// https://github.com/GoogleChrome/chrome-extensions-samples/blob/1d8d137d20fad5972292377dc22498529d2a4039/api/omnibox/simple-example/background.js

import * as _ from 'lodash';
import * as Asana from 'asana';
import { Gid } from './asana-types.ts';
import { SuggestFunction } from './chrome-types.ts';

import {
  logError as logErrorOrig, pullCustomFieldGid, escapeHTML, pullTypeaheadSuggestions, upvoteTask,
  client, logSuccess, pullCustomFieldFn,
} from './upvoter.ts';

// As of 4.4.4, TypeScript's control flow analysis is wonky with
// narrowing and functions that return never.  This is a workaround:
//
// https://github.com/microsoft/TypeScript/issues/36753
const logError: (err: string) => never = logErrorOrig;

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
  }

  interface Client {
    typeahead: resources.Typeahead;
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
/* eslint-enable camelcase */
/* eslint-enable max-len */

const createSuggestResult = ({
  task,
  customField,
}: {
  task: Asana.resources.Tasks.Type,
  customField: Asana.resources.CustomField | undefined
}): chrome.omnibox.SuggestResult => {
  if (customField === undefined) {
    logError('customField should never be undefined here!');
  }

  return {
    content: task.gid,
    description: escapeHTML(`${customField.number_value}: ${task.name}`),
  };
};

const passOnTypeaheadResultToOmnibox = (text: string) => ({ suggest, typeaheadResult }:
  { suggest: SuggestFunction, typeaheadResult: Asana.resources.TypeaheadResults }) => {
  chrome.omnibox.setDefaultSuggestion({
    description: '<dim>Processing results...</dim>',
  });
  console.log('typeaheadResult: ', typeaheadResult);
  return pullCustomFieldGid().then((customFieldGid: Gid) => {
    const suggestions = typeaheadResult.data
      .filter((task: Asana.resources.Tasks.Type) => !task.completed)
      .filter((task: Asana.resources.Tasks.Type) => task.parent == null)
      .filter((task: Asana.resources.Tasks.Type) => task.name.length > 0)
      .map(pullCustomFieldFn(customFieldGid))
      // TODO: understand the | undefined below - why not null?
      .filter(({ customField }: {
        customField: Asana.resources.CustomField | undefined
      }) => customField != null)
      .map(createSuggestResult);

    console.log(`${suggestions.length} suggestions from ${text}:`, suggestions);
    suggest(suggestions);
    const description = `<dim>${suggestions.length} results for ${text}:</dim>`;
    chrome.omnibox.setDefaultSuggestion({ description });
  });
};

const pullAndReportTypeaheadSuggestions = (text: string, suggest: SuggestFunction) => {
  pullTypeaheadSuggestions(text, suggest).then(passOnTypeaheadResultToOmnibox(text))
    .catch(logError);
};

const pullAndReportTypeaheadSuggestionsDebounced = _.debounce(pullAndReportTypeaheadSuggestions,
  500);

const omniboxInputChangedListener = (text: string, suggest: SuggestFunction) => {
  chrome.omnibox.setDefaultSuggestion({
    description: `<dim>Waiting for results from ${text}...</dim>`,
  });
  return pullAndReportTypeaheadSuggestionsDebounced(text, suggest);
};

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(omniboxInputChangedListener);

const omniboxInputEnteredListener = (taskGid: Gid) => {
  client.tasks.getTask(taskGid)
    .then(upvoteTask)
    .then(logSuccess)
    .catch(logError);
};

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(omniboxInputEnteredListener);
