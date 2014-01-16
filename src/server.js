var Server = function(config) {
};
Server.prototype.start = function() {
  var app = require('express')();

  var render_root = function(req, res) {
    var html = [];
    html.push('<head>');
    html.push('  <title>Twitter Community Bot at your service</title>');
    html.push('</head>');
    html.push('<body>');
    html.push('  <h1>Twitter Community Bot</h1>');
    html.push('  <h4>Like a megaphone, but quieter.</h4>');
    html.push('  <p><b>todo:</b> list tweets in the DB</p>');
    html.push('  <p>rendered at ' + new Date().toString() + '</p>');
    html.push('</body>');
    res.send('<html>' + html.join('') + '</html>');
  };

  app.get('/', render_root);

  var port = process.env.PORT || 3000;
  app.listen(port);
  console.log("Express is running on port " + port);
};

if (module) {
  module.exports = Server;
}
