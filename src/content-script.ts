import { Gid } from './asana-types';
import {
  upvoteTask, client, logError as logErrorOrig, logSuccess, pullCustomFieldGid, pullCustomFieldFn,
} from './upvoter';

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

const populateCurrentCount = async (dependentTaskGid: Gid, link: Element) => {
  const customFieldGid = await pullCustomFieldGid();

  const pullCustomField = pullCustomFieldFn(customFieldGid);

  const task = await client.tasks.getTask(dependentTaskGid);
  const { customField } = pullCustomField(task);

  updateLinkMarker(link, customField?.number_value);
};

const upvote = async (dependentTaskGid: Gid, link: Element) => {
  updateLinkMarker(link, '^^');
  await client.tasks.getTask(dependentTaskGid)
    .then(upvoteTask)
    .then(logSuccess);
  populateCurrentCount(dependentTaskGid, link);
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
