(() => {
  netlifyIdentity.on('error', err => console.error('Error', err));
})();
