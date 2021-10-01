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
        link.setAttribute('href', 'https://www.jwz.org/');
        link.innerHTML += ' [123]';
        link.classList.add(upvoteLinkClassName);
      }
    }
  }
}, 1000);
