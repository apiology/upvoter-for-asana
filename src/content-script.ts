import * as Asana from 'asana';
import { Gid } from './asana-types';
import {
  upvoteTask, client, logError as logErrorOrig, logSuccess, pullCustomFieldGid, pullCustomFieldFn,
} from './upvoter';

// As of 4.4.4, TypeScript's control flow analysis is wonky with
// narrowing and functions that return never.  This is a workaround:
//
// https://github.com/microsoft/TypeScript/issues/36753
const logError: (err: string) => never = logErrorOrig;

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable camelcase */
/* eslint-disable max-len */
// extends https://github.com/DefinitelyTyped/DefinitelyTyped/blob/01906126b2ced50d3119dc09aa64fbe5f4bb9ff2/types/asana/index.d.ts#L2857
declare module 'asana' {
  namespace resources {
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
}
/* eslint-enable @typescript-eslint/no-explicit-any */
/* eslint-enable @typescript-eslint/no-namespace */
/* eslint-enable camelcase */
/* eslint-enable max-len */

const updateLinkMarker = (link: Element, indicator: number | string | null | undefined) => {
  let message = indicator;
  if (message == null) {
    message = 'N/A';
  }
  link.innerHTML = link.innerHTML.replace(/ \[.*\]$/, ` [${message}]`);
};

const upvoteLinkClassName = 'upvoter-upvote-link';

const populateCurrentCount = (dependentTaskGid: Gid, link: Element) => pullCustomFieldGid()
  .then((customFieldGid: Gid) => {
    const pullCustomField = pullCustomFieldFn(customFieldGid);
    return client.tasks.getTask(dependentTaskGid)
      .then(pullCustomField)
      .then(({ customField }:
        {
          customField:
          Asana.resources.CustomField | undefined
        }) => {
        updateLinkMarker(link, customField?.number_value);
      });
  });

const upvote = (dependentTaskGid: Gid, link: Element) => {
  updateLinkMarker(link, '^^');
  client.tasks.getTask(dependentTaskGid)
    .then(upvoteTask)
    .then(logSuccess)
    .then(() => populateCurrentCount(dependentTaskGid, link));
};

const onDependentTaskClickFn = (dependentTaskGid: Gid, link: Element) => (event: MouseEvent) => {
  upvote(dependentTaskGid, link);
  event.stopPropagation();
};

const fixUpLinkToDependency = (link: HTMLElement) => {
  const url = link.getAttribute('href');
  if (url != null) {
    const dependentTaskGid = url.split('/').at(-1);
    if (dependentTaskGid == null) {
      logError(`Could not parse URL: ${url}`);
    }
    link.removeAttribute('href');
    link.innerHTML += ' [...]';
    populateCurrentCount(dependentTaskGid, link);
    link.onclick = onDependentTaskClickFn(dependentTaskGid, link);
    link.classList.add(upvoteLinkClassName);
  }
};

const dependencyLinks = () => {
  const links: HTMLElement[] = [];
  const bodyNodesClassName = 'CompleteTaskWithIncompletePrecedentTasksConfirmationModal-bodyNode';

  const bodyNodes = Array.from(document.getElementsByClassName(bodyNodesClassName));
  for (const bodyNode of bodyNodes) {
    const linkClassName = 'CompleteTaskWithIncompletePrecedentTasksConfirmationModal-primaryNavigationLink';
    for (const element of Array.from(bodyNode.getElementsByClassName(linkClassName))) {
      if (element instanceof HTMLElement) {
        links.push(element);
      } else {
        logError('Element is not an HTMLElement!');
      }
    }
  }
  return links;
};

setInterval(() => {
  for (const dependencyLink of dependencyLinks()) {
    // don't process links twice; if we've marked one as processed, consider this done.
    if (dependencyLink.classList.contains(upvoteLinkClassName)) {
      break;
    }
    fixUpLinkToDependency(dependencyLink);
  }
}, 1000);
