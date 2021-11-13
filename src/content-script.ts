import * as Asana from 'asana';

import {
  upvoteTask, client, logSuccess, pullCustomFieldGid, pullCustomFieldFn,
} from './upvoter.ts';

import { Gid } from './asana-types.ts';

// extends https://github.com/DefinitelyTyped/DefinitelyTyped/blob/01906126b2ced50d3119dc09aa64fbe5f4bb9ff2/types/asana/index.d.ts#L2857
declare module 'asana' {
  namespace resources { // eslint-disable-line @typescript-eslint/no-namespace
    interface CustomField extends Resource {
      enabled: boolean;
      enum_options: EnumValue[] | null; // eslint-disable-line camelcase
      enum_value: EnumValue | null; // eslint-disable-line camelcase
      number_value: number | null; // eslint-disable-line camelcase
    }
  }
}

const updateLinkMarker = (link: Element, indicator: string) => {
  link.innerHTML = link.innerHTML.replace(/ \[.*\]$/, ` [${indicator}]`);
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
          Asana.resources.CustomField
        }) => updateLinkMarker(link, customField.number_value));
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
    links.push(...Array.from(bodyNode.getElementsByClassName(linkClassName)));
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
