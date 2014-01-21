var EE = require('events').EventEmitter;
var express = require('express');
var exphbs = require('express3-handlebars');

var WebServer = function() {
  this.app = express();
  this.port = process.env.PORT || 3000;
  this.stuff = '';
  this.tweets_posted = [];
  this.tweets_queued = {};
};

// extend WebServer with EventEmitter
WebServer.prototype = new EE();

WebServer.prototype.start = function() {

  this.app.use(express.logger());
  this.app.use(express.static('assets')); // static files... no '/assets' in url

  this.app.engine('handlebars', exphbs({defaultLayout: 'main'}));
  this.app.set('view engine', 'handlebars');

  //this.app.get('/', this.render_root.bind(this));
  var self = this;
  this.app.get('/', function(req,res) {
    console.log(self.tweets_queued_id_strs());
    res.render('home', {
      params: req.params
      , tweets_queued: self.tweets_queued
      , tweets_queued_length: self.tweets_queued_id_strs().length
      , tweets_posted: self.tweets_posted
    });
  });
  //this.app.post('/repost/:tweet_id_str', this.repost_queued.bind(this));
  this.app.post('/repost/:tweet_id_str', function(req, res) {
    var tweet = self.tweets_queued[req.params.tweet_id_str];
    delete(self.tweets_queued[req.params.tweet_id_str]);
    self.repost_queued(tweet);
    res.redirect('/');
  });

  this.app.listen(this.port);
  console.log("Express is running on port " + this.port);

  this.started_at = new Date();
};

/*
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
*/

WebServer.prototype.repost_queued = function(tweet) {
  console.log('repost queued ' + tweet.id_str);
  this.emit('tweet_approved', tweet);
  // potential race condition here
  delete(this.tweets_queued[tweet.id_str]);
  console.log('tweets queued:');
  console.log(this.tweets_queued_id_strs);
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
  this.tweets_queued[tweet.id_str] = tweet;
  console.log(this.tweets_queued_id_strs());
};

WebServer.prototype.tweets_queued_id_strs = function() {
  return Object.keys(this.tweets_queued);
};

/*
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
*/

if (module) {
  module.exports = WebServer;
}
