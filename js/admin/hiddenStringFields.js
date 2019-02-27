(() => {
  const SELECTORS = {
    // control: '.nc-controlPane-control', // Netlify-cms 1.9.2
    // label: '.nc-controlPane-label', // Netlify-cms 1.9.2
    control: '.ei073ck0',
    label: '.css-1skqem4',
  };

  const findHiddenStrings = () => {
    document.querySelectorAll(SELECTORS.control).forEach((field) => {
      field.querySelectorAll(SELECTORS.label).forEach((label) => {
        if (label.textContent === '[hidden]') {
          field.hidden = true;
        }
      });
    });
  };

  // Because it's a React app, its nodes are constantly re-rendered,
  // so we need to keep reapplying our listener.
  const observer = new MutationObserver(() => {
    findHiddenStrings();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  findHiddenStrings();
})();
