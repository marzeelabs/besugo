(() => {
  const SELECTORS = {
    // container: '.nc-app-container', // Netlify-cms 1.9.2
    container: '.notif__container',
  };

  const findAppContainer = () => {
    const nodes = document.querySelectorAll(SELECTORS.container);
    if (nodes.length > 0) {
      document.body.classList.add('logged-in');
    }
    else {
      document.body.classList.remove('logged-in');
    }
  };

  // Because it's a React app, its nodes are constantly re-rendered,
  // so we need to keep reapplying our listener.
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      findAppContainer();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  findAppContainer(document.body);
})();
