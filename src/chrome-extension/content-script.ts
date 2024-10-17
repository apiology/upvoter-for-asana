/**
 * content-script module.
 *
 * If you mark a task done which has dependent upvotable tasks in
 * Asana, adds ability to click on the dependent task links to upvote
 * those tasks.
 */

import { fetchClient } from '../asana-base.js';
import { upvoteTask, logSuccess, pullCustomField } from '../upvoter-for-asana.js';
import { platform, setPlatform } from '../platform.js';
import { ChromeExtensionPlatform } from './chrome-extension-platform.js';
import { waitForPopulatedAttr } from './dom-utils.js';

const updateLinkMarker = (link: Element, indicator: number | string | null | undefined) => {
  let message = indicator;
  if (message == null) {
    message = 'N/A';
  }
  // https://regex101.com/r/ySpO01/1
  link.innerHTML = link.innerHTML.replace(/ \[(\^\^|-?[0-9]+|\.+)*\]$/, ` [${message}]`);
};

const upvoteLinkClassName = 'upvoter-upvote-link';

const populateCurrentCount = async (dependentTaskGid: string, link: Element):
  Promise<number | null | undefined> => {
  const client = await fetchClient();
  const task = await client.tasks.getTask(dependentTaskGid);
  const customField = await pullCustomField(task);

  const number = customField?.number_value;
  updateLinkMarker(link, customField?.number_value);
  return number;
};

const upvote = async (dependentTaskGid: string, link: Element) => {
  try {
    const logger = platform().logger();

    logger.debug('updating link marker');
    updateLinkMarker(link, '^^');
    logger.debug('updated link marker');
    const client = await fetchClient();
    logger.debug('client', client);
    const task = await client.tasks.getTask(dependentTaskGid);
    logger.debug('task', task);
    await upvoteTask(task);
    logSuccess(task);
    await populateCurrentCount(dependentTaskGid, link);
  } catch (err) {
    alert(`Problem upvoting ${dependentTaskGid}: ${err}`);
    // throw err;
  }
};

const fixUpLinkToDependency = async (link: HTMLElement) => {
  const logger = platform().logger();

  link.classList.add(upvoteLinkClassName);
  logger.debug('Waiting for populated href on', link.outerHTML);
  const href = await waitForPopulatedAttr(link, 'href');
  logger.debug('Found populated href on', link);
  const url = href.value;
  const dependentTaskGid = url.split('/').at(-1);
  logger.debug('Found dependent task GID', JSON.stringify(dependentTaskGid), 'for URL', JSON.stringify(url), 'on', link);
  if (dependentTaskGid == null || dependentTaskGid === '') {
    throw new Error(`Could not parse URL: ${url}`);
  }
  link.removeAttribute('href');
  link.innerHTML += ' [...]';
  const count = await populateCurrentCount(dependentTaskGid, link);
  link.onclick = (event: MouseEvent) => {
    if (count) {
      upvote(dependentTaskGid, link);
    }
    event.stopPropagation();
  };
};

const bodyNodesClassName = 'CompleteTaskWithIncompletePrecedentTasksConfirmationModal-bodyNode';

const dependencyLinks = () => {
  const links: HTMLElement[] = [];
  const bodyNodes = Array.from(document.getElementsByClassName(bodyNodesClassName));
  for (const bodyNode of bodyNodes) {
    const linkClassName = 'CompleteTaskWithIncompletePrecedentTasksConfirmationModal-primaryNavigationLink';
    for (const element of Array.from(bodyNode.getElementsByClassName(linkClassName))) {
      if (element instanceof HTMLElement) {
        links.push(element);
      } else {
        throw new Error('Element is not an HTMLElement!');
      }
    }
  }
  return links;
};

const fixDependencyLinks = async () => {
  const logger = platform().logger();

  for (const dependencyLink of dependencyLinks()) {
    // don't process links twice; if we've marked one as processed, consider this done.
    if (dependencyLink.classList.contains(upvoteLinkClassName)) {
      logger.debug("Skipping link that's already been processed", dependencyLink?.outerHTML);
      break;
    }
    logger.debug('Fixing up link', dependencyLink?.outerHTML);
    fixUpLinkToDependency(dependencyLink);
  }
};

export const observeAndFixDependencyLinks = async () => {
  const logger = platform().logger();

  const selector = `.${bodyNodesClassName} a`;
  logger.debug(`Starting observation on ${selector}`);
  const observer = new MutationObserver(() => {
    const element = document.querySelector(selector);
    // logger.finer('Mutation observed - is now', element?.outerHTML);
    if (element) {
      fixDependencyLinks();
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  logger.debug('Done with starting observation');

  const e = document.querySelector(selector);
  if (e) {
    await fixDependencyLinks();
  }
};

/* istanbul ignore next */
if (typeof jest === 'undefined') {
  setPlatform(new ChromeExtensionPlatform());

  observeAndFixDependencyLinks();
}
