(function() {
  const req = require.context("./admin", true, /\.js$/);
  req.keys().forEach(function(key) {
    req(key);
  });
})();
