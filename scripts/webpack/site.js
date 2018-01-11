(function() {
  const req = require.context("../../js/site", true, /\.js$/);
  req.keys().forEach(function(key) {
    req(key);
  });
})();
