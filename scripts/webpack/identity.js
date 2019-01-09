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

    const getHashParameter = (name) => {
      let { hash } = window.location;

      while ([ '#', '/' ].indexOf(hash.substring(0, 1)) !== -1) {
        hash = hash.substring(1);
      }

      const hashPairs = hash.split('&');
      const parameters = new Map();

      hashPairs.forEach((str) => {
        const pair = str.split('=');

        if (pair.length === 2) {
          const value = decodeURIComponent(pair[1].replace(/\+/g, '%20'));
          parameters.set(pair[0], value);
        }
        else {
          parameters.set(pair[0], null);
        }
      });

      return parameters.get(name);
    };

    const error = getHashParameter('error');
    if (error) {
      const description = getHashParameter('error_description');

      // eslint-disable-next-line no-console
      console.error({
        error,
        description,
      });
    }
  }
})();
