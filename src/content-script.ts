/**
 * content-script module.
 *
 * If you mark a task done which has dependent upvotable tasks in
 * Asana, adds ability to click on the dependent task links to upvote
 * those tasks.
 */

import { client } from './asana-typeahead';
import { logError as logErrorOrig } from './error';
import { upvoteTask, logSuccess, pullCustomField } from './upvoter';

// As of 4.4.4, TypeScript's control flow analysis is wonky with
// narrowing and functions that return never.  This is a workaround:
//
// https://github.com/microsoft/TypeScript/issues/36753
const logError: (err: string) => never = logErrorOrig;

const updateLinkMarker = (link: Element, indicator: number | string | null | undefined) => {
  let message = indicator;
  if (message == null) {
    message = 'N/A';
  }
  link.innerHTML = link.innerHTML.replace(/ \[.*\]$/, ` [${message}]`);
};

const upvoteLinkClassName = 'upvoter-upvote-link';

const populateCurrentCount = async (dependentTaskGid: string, link: Element) => {
  const task = await client.tasks.getTask(dependentTaskGid);
  const customField = await pullCustomField(task);

  updateLinkMarker(link, customField?.number_value);
};

const upvote = async (dependentTaskGid: string, link: Element) => {
  updateLinkMarker(link, '^^');
  const task = await client.tasks.getTask(dependentTaskGid);
  await upvoteTask(task);
  logSuccess(task);
  await populateCurrentCount(dependentTaskGid, link);
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
    link.onclick = (event: MouseEvent) => {
      upvote(dependentTaskGid, link);
      event.stopPropagation();
    };
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
