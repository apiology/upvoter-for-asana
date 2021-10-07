const {
  upvoteTask, client, logSuccess,
} = require('./upvoter.js');

setInterval(() => {
  const bodyNodesClassName = 'CompleteTaskWithIncompletePrecedentTasksConfirmationModal-bodyNode';

  const bodyNodes = Array.from(document.getElementsByClassName(bodyNodesClassName));
  for (const bodyNode of bodyNodes) {
    const linkClassName = 'CompleteTaskWithIncompletePrecedentTasksConfirmationModal-primaryNavigationLink';
    const links = Array.from(bodyNode.getElementsByClassName(linkClassName));
    const upvoteLinkClassName = 'upvoter-upvote-link';
    const upvoteLinks = Array.from(bodyNode.getElementsByClassName(upvoteLinkClassName));
    if (upvoteLinks.length === 0) {
      for (const link of links) {
        console.log('link', link);
        console.log('innerHTML', link.innerHTML);
        const url = link.getAttribute('href');
        const dependentTaskGid = url.split('/').at(-1);
        link.removeAttribute('href');
        console.log('Looking for dependentTaskGid', dependentTaskGid);
        link.innerHTML += ' [...]';
        link.onclick = (event) => {
          client.tasks.getTask(dependentTaskGid)
            .then(upvoteTask)
            .then(logSuccess)
            .then(() => {
              link.innerHTML += ' [^]';
            });
          event.stopPropagation();
        };
        link.classList.add(upvoteLinkClassName);
      }
    }
  }
}, 1000);
