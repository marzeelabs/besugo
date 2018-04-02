(function() {
  const req = require.context("../../js/admin", true, /\.js$/);
  req.keys().forEach(function(key) {
    req(key);
  });
})();
