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

// extend WebServer with EventEmitter. TODO mixin instead of set prototype?
WebServer.prototype = new EE();

WebServer.prototype.define_routes = function() {
  // TODO abstract this a little
  this.app.get( '/',                     this.render_home.bind(this));
  this.app.get( '/tweets',               this.all_tweets.bind(this));
  this.app.post('/repost/:tweet_id_str', this.repost_and_redirect.bind(this));
};

WebServer.prototype.all_tweets = function(request, response) {
  return this.TweetModel.find(function(err, tweets) {
    if (err) {
      return console.log('error: ',err);
    }
    return response.send(tweets);
  });
};

WebServer.prototype.start = function() {
  // express config
  this.app.use(express.logger());
  this.app.use(express.static('assets')); // static files... no '/assets' in url

  // view templates
  this.app.engine('handlebars', exphbs({defaultLayout: 'main'}));
  this.app.set('view engine', 'handlebars');

  // fire it up
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
    self.queued_tweets = tweets.map(self.record_to_tweet_instance.bind(this));
    console.log('found tweets in db:', self.queued_tweets.map(function(tweet) { return tweet.to_string(); }));
    callback();
    return tweets;
  });
};

WebServer.prototype.record_to_tweet_instance = function(tweet) {
  if (tweet && tweet.original_tweet_json) {
    return new Tweet(tweet.original_tweet_json);
  }
  console.error('WebServer#record_to_tweet_instance: tweet missing original_tweet_json',tweet);
};

WebServer.prototype.repost_and_redirect = function(req, res) {
  var self = this;
  this.TweetModel.findOne({tweet_id_str: req.params.tweet_id_str}, function(err, tweet_from_db) {
    console.log('db find ' + req.params.tweet_id_str, tweet_from_db);
    if (!tweet_from_db) {
      throw new Error('tweet not found with tweet_id_str:' + req.params.tweet_id_str);
    }
    var tweet = self.record_to_tweet_instance(tweet_from_db);
    console.log('approving:',tweet.to_string());
    self.approve(tweet, function() {
      console.log('redirecting to /');
      res.redirect('/');
    });
  });
};

WebServer.prototype.approve = function(tweet, callback) {
  console.log('emitting approved message', tweet.to_string());
  this.emit('tweet_approved', tweet, callback);
};

if (module) {
  module.exports = WebServer;
}
