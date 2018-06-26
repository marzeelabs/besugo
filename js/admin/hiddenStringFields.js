(() => {
  const findHiddenStrings = () => {
    document.querySelectorAll('.nc-controlPane-control').forEach((field) => {
      field.querySelectorAll('.nc-controlPane-label').forEach((label) => {
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
