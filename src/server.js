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

  this.app.get('/', this.render_home.bind(this));

  this.app.post('/repost/:tweet_id_str', this.repost_and_redirect.bind(this));

  this.app.listen(this.port);
  console.log("Express is running on port " + this.port);

  this.started_at = new Date();
};

WebServer.prototype.render_home = function(req,res) {
  res.render('home', {
    params: req.params
    , tweets_queued: this.tweets_queued
    , tweets_queued_length: this.tweets_queued_id_strs().length
    , tweets_posted: this.tweets_posted
  });
};

WebServer.prototype.repost_and_redirect = function(req, res) {
  var tweet = this.tweets_queued[req.params.tweet_id_str];
  delete(this.tweets_queued[req.params.tweet_id_str]);
  this.repost_queued(tweet);
  res.redirect('/');
};

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

if (module) {
  module.exports = WebServer;
}
