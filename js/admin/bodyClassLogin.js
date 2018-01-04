(function() {
  const findAppContainer = function(target) {
    const nodes = document.querySelectorAll('.nc-app-container');
    if (nodes.length > 0) {
      document.body.classList.add('logged-in');
    } else {
      document.body.classList.remove('logged-in');
    }
  };

  // Because it's a React app, its nodes are constantly re-rendered, so we need to keep reapplying our listener.
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      findAppContainer(m.target);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  findAppContainer(document.body);
})();
