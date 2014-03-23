var EE = require('events').EventEmitter;
var express = require('express');
var exphbs = require('express3-handlebars');

var WebServer = function(config) {
  var self = this;

  this.db = config.db;
  this.TweetModel = config.TweetModel;

  this.app = express();
  this.port = process.env.PORT || 3000;
  this.stuff = '';
  this.listening_for = config.listening_for;
  this.posting_as = config.posting_as;

  this.app.get('/tweets', function(request, response) {
    return self.TweetModel.find(function(err, tweets) {
      if (err) {
        return console.log('error: ',err);
      }
      return response.send(tweets);
    });
  });
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
  var now = new Date();
  var tweets_queued = this.tweets_queued();
  res.render('home', {
    params: req.params,
    listening_for: this.listening_for,
    posting_as: this.posting_as,
    tweets_queued: tweets_queued,
    tweets_queued_length: tweets_queued.length,
    tweets_posted: this.tweets_posted,
    started_at_str: this.started_at.toString(),
    started_at_iso: this.started_at.toISOString(),
    render_time_str: now.toString(),
    render_time_iso: now.toISOString()
  });
};

WebServer.prototype.tweets_queued = function get_queued_tweets() {
  jQuery.get('/tweets', function(data, status, jqXHR) {
    // ...
  });
};

WebServer.prototype.repost_and_redirect = function(req, res) {
  throw new Error('not here yet');
  var tweet = this.tweets_queued[req.params.tweet_id_str];
  delete(this.tweets_queued[req.params.tweet_id_str]);
  this.approve(tweet);
  res.redirect('/');
};

WebServer.prototype.approve = function(tweet) {
  throw new Error('not here yet');
  console.log('approved: ' + tweet.id_str);
  this.emit('tweet_approved', tweet);
  // potential race condition here
  delete(this.tweets_queued[tweet.id_str]);
};

WebServer.prototype.tweet_posted = function(tweet) {
  this.tweets_posted.push(tweet);
};

WebServer.prototype.queue_tweet = function(tweet) {
  this.tweets_queued[tweet.id_str] = tweet;
};

WebServer.prototype.tweets_queued_id_strs = function() {
  return Object.keys(this.tweets_queued);
};

if (module) {
  module.exports = WebServer;
}
