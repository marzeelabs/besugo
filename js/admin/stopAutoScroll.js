(function() {
  const findPanes = function(parent) {
    // CMS listens for the scroll event in its vertical panels to keep them in sync:
    // https://github.com/netlify/netlify-cms/tree/master/src/components/ScrollSync
    const panes = parent && parent.querySelectorAll('.Pane.vertical');
    if(panes) {
      panes.forEach(follow);
    }
  };

  const findIframe = function(parent) {
    // It also listens from inside the preview iframe.
    const iframe = parent && parent.querySelector('.cms__PreviewPane__frame');
    if(iframe) {
      follow(iframe.contentWindow);
    }
  };

  const follow = function(pane) {
    pane.addEventListener('scroll', function(e) {
      // We only need to prevent this event from reaching CMS's own event listeners in its React components.
      e.stopPropagation();
    }, true);
  };

  // Because it's a React app, its nodes are constantly re-rendered, so we need to keep reapplying our listener.
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      findPanes(m.target);
      findIframe(m.target);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Disable scroll sync if we're loading directly into an editing page.
  findPanes(document.body);
  findIframe(document.body);
})();
