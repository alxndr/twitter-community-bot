var EE = require('events').EventEmitter;

var Server = function() {
  this.express = require('express')();
  this.port = process.env.PORT || 3000;
  this.stuff = '';
  this.tweets = [];

  this.on('posted', function(tweet) {
    this.tweets.push(tweet);
  });
};

// extend Server with EventEmitter
Server.prototype = new EE();

Server.prototype.start = function(yieldd) {
  this.express.get('/', this.render_root.bind(this));
  this.express.listen(this.port);
  console.log("Express is running on port " + this.port);
};

Server.prototype.render_root = function(req, res) {
  var html = [];
  html.push('<head>');
  html.push('  <title>Twitter Community Bot at your service</title>');
  html.push('</head>');
  html.push('<body>');
  html.push('  <h1>Twitter Community Bot</h1>');
  html.push('  <h4>Like a megaphone, but quieter.</h4>');
  html.push(   this.content_for('body'));
  html.push('</body>');
  res.send('<html>' + html.join('') + '</html>');
};

Server.prototype.content_for = function(_where) {
  // just body content so far
  if (!this.tweets.length) {
    return '<p>No tweets!</p>';
  }
  var html = [];
  html.push('<ul>');
  for (var i in this.tweets) {
    var tweet = this.tweets[i];
    html.push('<li>');
    html.push(  tweet.to_html());
    html.push(  '<span class="link">[<a href="' + tweet.url + '">link</a>]</span>');
    html.push('</li>');
  }
  html.push('</ul>');
  return html.join('');
};

if (module) {
  module.exports = Server;
}
