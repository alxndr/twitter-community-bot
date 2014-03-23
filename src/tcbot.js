/* global require, console, module */

var EE = require('events').EventEmitter;
var Tweet = require('./tweet.js');

var TCBot = function(config) {
  this.db = config.db;
  this.TweetModel = config.TweetModel;

  this.T = config.T;
  this.own_username = config.own_username;
  this.term = config.term;
  this.mute = config.mute;
  if (!this.mute) {
    console.log('posting as ' + this.own_username);
  }

  this.trim_regex = new RegExp('^\\s*@' + this.own_username + '\\s+');

  this.tweet_queue = [];
};

// extend TCBot with EventEmitter
TCBot.prototype = new EE();

TCBot.prototype.start = function() {
  var stream = this.T.stream('statuses/filter', { track: this.term, lang: 'en' });
  console.log('listening for "' + this.term + '"');
  stream.on('tweet', this.term_mentioned.bind(this));
  stream.on('limit', this.limited.bind(this));
};

TCBot.prototype.term_mentioned = function(tweet_json) {
  var tweet = new Tweet(tweet_json);
  console.log('heard: ' + tweet.to_string());

  if (this.should_repost(tweet)) {
    this.repost(tweet);
  } else {
    this.queue(tweet);
  }
};

TCBot.prototype.should_repost = function(tweet) {
  if (tweet.is_by(this.own_username)) {
    // TODO be nice to have twit/twitter filter us out for us
    return false;
  }

  if (tweet.is_native_retweet()) {
    return false;
  }

  if (tweet.text().match(/\bthanks\b/i)) {
    return false;
  }

  // tweet.in_reply_to_screen_name == this.username
  // tweet.retweet_count > 0 // n.b.: .retweeted is whether we've RT'd
  // tweet.text().match(/\sRT @\w+/) // non-native RTs

  // TODO
  // similar tweets
  // overposts
  // keep track of why something was blocked?

  return false; // short-circuit to queue everything
};

TCBot.prototype.repost = function(tweet) {
  // will emit 'posted' on success
  var self = this;
  if (this.mute) {
    console.log('MUTE');
    this.emit('posted', tweet);
    return;
  }
  var text = tweet.process_text(this.trim_regex);
  this.T.post(
    'statuses/update',
    { status: text },
    function(err, tweet_json) {
      if (err) {
        console.error(err);
        console.error('!! ERROR reposting');
        /* when duplicate status, err ==
        { [Error: Status is a duplicate.]
          message: 'Status is a duplicate.',
          statusCode: 403,
          code: 187,
          allErrors: [ { code: 187, message: 'Status is a duplicate.' } ],
          twitterReply: '{"errors":[{"code":187,"message":"Status is a duplicate."}]}' }
        */
      } else {
        var tweet = new Tweet(tweet_json);
        console.log('posted: ' + tweet.to_string());
        self.emit('posted', tweet);
      }
    }
  );
};

TCBot.prototype.queue = function(tweet) {
  // will emit 'queued' on success
  var self = this;
  console.log('going to make model out of',tweet.data_for_db());
  var tweet_model = new this.TweetModel(tweet.data_for_db());
  console.log('trying to save...',tweet_model);
  tweet_model.save(function() {
    console.log('saved');
    self.emit('queued', tweet);
  });
};

TCBot.prototype.limited = function() {
  console.log('*** DEBUG received limited message from twitter');
  console.log(arguments);
};

if (module) {
  module.exports = TCBot;
}
