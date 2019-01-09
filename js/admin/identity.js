(() => {
  if (window.netlifyIdentity) {
    // eslint-disable-next-line no-console
    netlifyIdentity.on('error', err => console.error('Error', err));

    netlifyIdentity.on('init', (user) => {
      if (!user) {
        netlifyIdentity.on('login', () => {
          document.location.href = '/admin/';
        });
      }
    });
  }
})();
