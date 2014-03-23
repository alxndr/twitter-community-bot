/* global process, require, console, module */

var EE = require('events').EventEmitter;
var Tweet = require('./tweet.js');
var express = require('express');
var exphbs = require('express3-handlebars');

var WebServer = function(config) {
  this.db = config.db;
  this.TweetModel = config.TweetModel;

  this.app = express();
  this.port = process.env.PORT || 3000;
  this.stuff = '';
  this.listening_for = config.listening_for;
  this.posting_as = config.posting_as;

  this.define_routes();
};

// extend WebServer with EventEmitter
WebServer.prototype = new EE();

WebServer.prototype.define_routes = function() {
  var self = this;
  this.app.get('/tweets', function(request, response) {
    return self.TweetModel.find(function(err, tweets) {
      if (err) {
        return console.log('error: ',err);
      }
      return response.send(tweets);
    });
  });
};

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
  var self = this;
  var now = new Date();
  this.update_queued_tweets(function() {
    res.render('home', {
      params: req.params,
      listening_for: self.listening_for,
      posting_as: self.posting_as,
      tweets_queued: self.queued_tweets,
      tweets_queued_length: self.queued_tweets.length,
      tweets_posted: self.tweets_posted,
      started_at_str: self.started_at.toString(),
      started_at_iso: self.started_at.toISOString(),
      render_time_str: now.toString(),
      render_time_iso: now.toISOString()
    });
  });
};

WebServer.prototype.update_queued_tweets = function(callback) {
  var self = this;
  this.TweetModel.find(function(err, tweets) {
    if (err) {
      return console.log('error', err, tweets);
    }
    console.log('found tweets', tweets);
    self.queued_tweets = tweets.map(function(tweet) {
      if (tweet && tweet.original_tweet_json) {
        return new Tweet(tweet.original_tweet_json);
      }
    });
    callback();
    return tweets;
  });
};

WebServer.prototype.repost_and_redirect = function(_req, _res) { // jshint unused: false
  // should get folded in to #approve?
  throw new Error('not here yet');
  /*
  var tweet = this.tweets_queued[req.params.tweet_id_str];
  delete(this.tweets_queued[req.params.tweet_id_str]);
  this.approve(tweet);
  res.redirect('/');
  */
};

WebServer.prototype.approve = function(tweet) { // jshint unused: false
  // find tweet in db
  // attempt repost
  // if successful, remove from db
  throw new Error('not here yet');
  /*
  console.log('approved: ' + tweet.id_str);
  this.emit('tweet_approved', tweet);
  // potential race condition here
  delete(this.tweets_queued[tweet.id_str]);
  */
};

if (module) {
  module.exports = WebServer;
}
