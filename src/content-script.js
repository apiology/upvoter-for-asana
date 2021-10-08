const {
  upvoteTask, client, logSuccess, pullCustomFieldGid, pullCustomFieldFn,
} = require('./upvoter.js');

const onDependentTaskClickFn = (dependentTaskGid, link) => (event) => {
  client.tasks.getTask(dependentTaskGid)
    .then(upvoteTask)
    .then(logSuccess)
    .then(() => {
      link.innerHTML += ' [^]';
    });
  event.stopPropagation();
};

const upvoteLinkClassName = 'upvoter-upvote-link';

const updateLinkMarker = (link, indicator) => {
  link.innerHTML = link.innerHTML.replace(/ \[.*\]$/, ` [${indicator}]`);
};

const populateInitialCount = (dependentTaskGid, link) => pullCustomFieldGid()
  .then((customFieldGid) => {
    const pullCustomField = pullCustomFieldFn(customFieldGid);
    return client.tasks.getTask(dependentTaskGid)
      .then(pullCustomField)
      .then(({ customField }) => updateLinkMarker(link, customField.number_value));
  });

const fixUpLinkToDependency = (link) => {
  const url = link.getAttribute('href');
  const dependentTaskGid = url.split('/').at(-1);
  link.removeAttribute('href');
  link.innerHTML += ' [...]';
  populateInitialCount(dependentTaskGid, link);
  link.onclick = onDependentTaskClickFn(dependentTaskGid, link);
  link.classList.add(upvoteLinkClassName);
};

setInterval(() => {
  const bodyNodesClassName = 'CompleteTaskWithIncompletePrecedentTasksConfirmationModal-bodyNode';

  const bodyNodes = Array.from(document.getElementsByClassName(bodyNodesClassName));
  for (const bodyNode of bodyNodes) {
    const linkClassName = 'CompleteTaskWithIncompletePrecedentTasksConfirmationModal-primaryNavigationLink';
    const links = Array.from(bodyNode.getElementsByClassName(linkClassName));
    const upvoteLinks = Array.from(bodyNode.getElementsByClassName(upvoteLinkClassName));
    if (upvoteLinks.length === 0) {
      // don't process links twice; if we've marked one as processed, consider this done.
      for (const link of links) {
        fixUpLinkToDependency(link);
      }
    }
  }
}, 1000);
