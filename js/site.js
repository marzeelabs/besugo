(function() {
  const req = require.context("./site", true, /\.js$/);
  req.keys().forEach(function(key) {
    req(key);
  });
})();
