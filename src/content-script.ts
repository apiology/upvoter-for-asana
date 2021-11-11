const {
  upvoteTask, client, logSuccess, pullCustomFieldGid, pullCustomFieldFn,
} = require('./upvoter.ts');

const updateLinkMarker = (link, indicator) => {
  link.innerHTML = link.innerHTML.replace(/ \[.*\]$/, ` [${indicator}]`);
};

const upvoteLinkClassName = 'upvoter-upvote-link';

const populateCurrentCount = (dependentTaskGid, link) => pullCustomFieldGid()
  .then((customFieldGid) => {
    const pullCustomField = pullCustomFieldFn(customFieldGid);
    return client.tasks.getTask(dependentTaskGid)
      .then(pullCustomField)
      .then(({ customField }) => updateLinkMarker(link, customField.number_value));
  });

const upvote = (dependentTaskGid, link) => {
  updateLinkMarker(link, '^^');
  client.tasks.getTask(dependentTaskGid)
    .then(upvoteTask)
    .then(logSuccess)
    .then(() => populateCurrentCount(dependentTaskGid, link));
};

const onDependentTaskClickFn = (dependentTaskGid, link) => (event) => {
  upvote(dependentTaskGid, link);
  event.stopPropagation();
};

const fixUpLinkToDependency = (link) => {
  const url = link.getAttribute('href');
  const dependentTaskGid = url.split('/').at(-1);
  link.removeAttribute('href');
  link.innerHTML += ' [...]';
  populateCurrentCount(dependentTaskGid, link);
  link.onclick = onDependentTaskClickFn(dependentTaskGid, link);
  link.classList.add(upvoteLinkClassName);
};

const dependencyLinks = () => {
  const links = [];
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
