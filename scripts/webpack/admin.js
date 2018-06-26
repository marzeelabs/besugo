(() => {
  const req = require.context('../../js/admin', true, /\.js$/);
  req.keys().forEach((key) => {
    req(key);
  });
})();
