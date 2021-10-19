const {
  upvoteTask, client, logSuccess, pullCustomFieldGid, pullCustomFieldFn,
} = require('./upvoter.js');

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

const onDependentTaskClickFn = (dependentTaskGid, link) => (event) => {
  updateLinkMarker(link, '^^');
  client.tasks.getTask(dependentTaskGid)
    .then(upvoteTask)
    .then(logSuccess)
    .then(() => populateCurrentCount(dependentTaskGid, link));
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

function* dependencyLinks() {
  const bodyNodesClassName = 'CompleteTaskWithIncompletePrecedentTasksConfirmationModal-bodyNode';

  const bodyNodes = Array.from(document.getElementsByClassName(bodyNodesClassName));
  for (const bodyNode of bodyNodes) {
    const linkClassName = 'CompleteTaskWithIncompletePrecedentTasksConfirmationModal-primaryNavigationLink';
    const links = Array.from(bodyNode.getElementsByClassName(linkClassName));
    for (const link of links) {
      yield link;
    }
  }
}

setInterval(() => {
  for (const dependencyLink of dependencyLinks()) {
    // don't process links twice; if we've marked one as processed, consider this done.
    if (dependencyLink.classList.contains(upvoteLinkClassName)) {
      break;
    }
    fixUpLinkToDependency(dependencyLink);
  }
}, 1000);

console.log('Defining upvoterKeyDown');
function upvoterKeyDown(e) {
  // this would test for whichever key is 40 (down arrow) and the ctrl key at the same time
  const nonZeroDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  if (e.metaKey && e.ctrlKey && nonZeroDigits.includes(e.key)) {
    const num = parseInt(e.key, 10);
    const links = Array.from(dependencyLinks());
    const linkFound = links[num - 1];
    console.log('linkFound', linkFound);
  }
}

document.addEventListener('keydown', upvoterKeyDown, false);
console.log('Registered keydown listener', upvoterKeyDown);
