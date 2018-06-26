(() => {
  const req = require.context('../../js/site', true, /\.js$/);
  req.keys().forEach((key) => {
    req(key);
  });
})();
