var EE = require('events').EventEmitter;

var WebServer = function() {
  this.express = require('express')();
  this.port = process.env.PORT || 3000;
  this.stuff = '';
  this.tweets_posted = [];
  this.tweets_queued = [];
};

// extend WebServer with EventEmitter
WebServer.prototype = new EE();

WebServer.prototype.start = function(yieldd) {
  this.express.get('/', this.render_root.bind(this));
  this.express.post('/repost/[:tweet_id_str:]', this.repost_queued.bind(this));

  this.express.listen(this.port);
  console.log("Express is running on port " + this.port);

  this.started_at = new Date();
};

WebServer.prototype.render_root = function(req, res) {
  var html = [];
  html.push('<head>');
  html.push(  '<title>Twitter Community Bot at your service</title>');
  html.push('</head>');
  html.push('<body>');
  html.push(  '<h1>Twitter Community Bot</h1>');
  html.push(  '<p>Like a megaphone, but quieter.</p>');
  html.push(  this.content_for('body'));
  html.push(  '<footer>');
  html.push(    this.content_for('footer'));
  html.push(  '</footer>');
  html.push('</body>');
  res.send('<html>' + html.join('') + '</html>');
};

WebServer.prototype.repost_queued = function(req, res) {
  console.log(req);
  console.log(res);
  console.log('repost_queued');
};

WebServer.prototype.tweet_posted = function(tweet) {
  this.tweets_posted.push(tweet);
  console.log('tweets posted:');
  for (var i in this.tweets_posted) {
    var tweet_posted = this.tweets_posted[i];
    console.log(tweet_posted.to_string());
  }
};

WebServer.prototype.queue_tweet = function(tweet) {
  this.tweets_queued.push(tweet);
  console.log('tweets queued:');
  for (var i in this.tweets_queued) {
    var tweet_queued = this.tweets_queued[i];
    console.log(tweet_queued.to_string());
  }
};

WebServer.prototype.content_for = function(where) {
  switch(where) {
    case 'body':
      return this.body_content();

    case 'footer':
      return this.footer_content();

    default:
      return '<!-- no content for ' + where + ' -->';
  }
};

WebServer.prototype.body_content = function() {
  var html = [];

  if (this.tweets_queued.length) {
    html.push('<p>Tweets in the queue:</p>');
    html.push('<ul>');
    for (var i in this.tweets_queued) {
      var tweet = this.tweets_queued[i];
      html.push('<li>');
      html.push(  '<button>post</button>');
      html.push(  tweet.to_html());
      html.push(  '<span class="link">[<a href="' + tweet.url + '">link</a>]</span>');
      html.push('</li>');
    }
    html.push('</ul>');
  }

  if (this.tweets_posted.length) {
    html.push('<p>Tweets already posted:</p>');
    html.push('<ul>');
    for (var i in this.tweets_posted) {
      var tweet = this.tweets_posted[i];
      html.push('<li>');
      html.push(  tweet.to_html());
      html.push(  '<span class="link">[<a href="' + tweet.url + '">link</a>]</span>');
      html.push('</li>');
    }
    html.push('</ul>');
  }

  if (!html.length) {
    return '<p>Nothing to talk about really.</p>';
  }
  return html.join('');
};

WebServer.prototype.footer_content = function() {
  var html = [];
  html.push('<p>bot started: ' + this.started_at.toString() + '</p>');
  html.push('<p>page rendered: ' + new Date().toString() + '</p>');
  return html.join('');
};

if (module) {
  module.exports = WebServer;
}
