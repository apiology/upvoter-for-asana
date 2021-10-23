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

console.log('Defining upvoterKeyDown');
function upvoterKeyDown(e) {
  // this would test for whichever key is 40 (down arrow) and the ctrl key at the same time
  const nonZeroDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  if (e.metaKey && e.ctrlKey && nonZeroDigits.includes(e.key)) {
    const num = parseInt(e.key, 10);
    const links = dependencyLinks();
    const linkFound = links[num - 1];
    console.log('linkFound', linkFound);
    linkFound.click();
  } else if (e.metaKey && e.key === 'Enter') {
    console.log('got meta enter');
    const markCompleteSelector = 'div.CompleteTaskWithIncompletePrecedentTasksConfirmationModal div.PrimaryButton';
    const element = document.querySelector(markCompleteSelector);
    if (element != null) {
      console.log('single element', element);
      console.log(e);
      element.click();
    }
  }
}

// capture: true ensures that we can differentiate between the
// cmd-enter key event when the dependent dialog is initially brought
// up, and when it was already up and the user wants to confirm to
// close the task.
document.addEventListener('keydown', upvoterKeyDown, { capture: true });
console.log('Registered keydown listener', upvoterKeyDown);
