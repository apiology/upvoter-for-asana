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

setPlatform(new ChromeExtensionPlatform());
const p = platform();
const logger = p.logger();

const updateLinkMarker = (link: Element, indicator: number | string | null | undefined) => {
  let message = indicator;
  if (message == null) {
    message = 'N/A';
  }
  // https://regex101.com/r/ySpO01/1
  link.innerHTML = link.innerHTML.replace(/ \[(\^\^|-?[0-9]+|\.+)*\]$/, ` [${message}]`);
};

const upvoteLinkClassName = 'upvoter-upvote-link';

const populateCurrentCount = async (dependentTaskGid: string, link: Element) => {
  const client = await fetchClient();
  const task = await client.tasks.getTask(dependentTaskGid);
  const customField = await pullCustomField(task);

  updateLinkMarker(link, customField?.number_value);
};

const upvote = async (dependentTaskGid: string, link: Element) => {
  try {
    console.log('updating link marker');
    updateLinkMarker(link, '^^');
    console.log('updated link marker');
    const client = await fetchClient();
    console.log('client', client);
    const task = await client.tasks.getTask(dependentTaskGid);
    console.log('task', task);
    await upvoteTask(task);
    console.log('upvoted task');
    logSuccess(task);
    await populateCurrentCount(dependentTaskGid, link);
  } catch (err) {
    alert(`Problem upvoting ${dependentTaskGid}: ${err}`);
    throw err;
  }
};

const fixUpLinkToDependency = (link: HTMLElement) => {
  const url = link.getAttribute('href');
  if (url != null) {
    const dependentTaskGid = url.split('/').at(-1);
    if (dependentTaskGid == null) {
      throw new Error(`Could not parse URL: ${url}`);
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
  for (const dependencyLink of dependencyLinks()) {
    // don't process links twice; if we've marked one as processed, consider this done.
    if (dependencyLink.classList.contains(upvoteLinkClassName)) {
      break;
    }
    fixUpLinkToDependency(dependencyLink);
  }
};

const observeAndFixDependencyLinks = () => {
  const selector = `.${bodyNodesClassName}`;
  const e = document.querySelector(selector);
  if (e) {
    fixDependencyLinks();
    logger.log('Fixed up links first try');
  } else {
    logger.log('First try did not find element');
  }

  const observer = new MutationObserver(() => {
    const element = document.querySelector(selector);
    if (element) {
      fixDependencyLinks();
      logger.log('Fixed up links incremental');
    } else {
      logger.log('Incremental did not find');
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

/* istanbul ignore next */
if (typeof jest === 'undefined') {
  logger.debug('Starting observation');
  observeAndFixDependencyLinks();
  logger.debug('Done with starting observation');
}
