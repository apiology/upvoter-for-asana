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
        const newNode = document.createElement('a');
        newNode.classList.add(upvoteLinkClassName);
        newNode.innerHTML = '<div style="font-size:20px;display:inline">⬆️</div>[123] ';
        const linkParent = link.parentNode;
        linkParent.insertBefore(newNode, link);
        console.log('link', link);
      }
    }
  }
}, 1000);
