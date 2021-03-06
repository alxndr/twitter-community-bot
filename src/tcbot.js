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

TCBot.prototype.limited = function() {
  console.log('*** DEBUG received limited message from twitter');
  console.log(arguments);
};

TCBot.prototype.queue = function(tweet) {
  // will emit 'queued' on success
  var self = this;
  console.log('queueing:',tweet.to_string());
  var tweet_model = new this.TweetModel(tweet.data_for_db());
  tweet_model.save(function() {
    console.log('saved');
    self.emit('queued');
  });
};

TCBot.prototype.remove_and_emit = function(tweet) {
  console.log('TCBot#remove_and_emit',tweet.to_string());
  var self = this;
  this.TweetModel.findOneAndRemove({tweet_id_str: tweet.id_str}, function(err) {
    if (err) {
      console.log(err);
      console.log('TCBot#remove_and_emit error!');
      return false;
    }
    console.log('removed tweet');
    self.emit('posted', tweet);
  });
};

TCBot.prototype.repost = function(tweet, callback) { // tweet should be JS Tweet instance
  // will emit 'posted' on success or dupe tweet error
  // TODO need a transaction or something
  var self = this;
  console.log('reposting',tweet.to_string());
  if (this.mute) {
    console.log('MUTE');
    this.emit('posted', tweet.to_string());
    return;
  }
  var text = tweet.process_text(this.trim_regex);
  this.T.post(
    'statuses/update',
    { status: text },
    function(err) {
      if (err) {
        if (err.message === 'Status is a duplicate.') {
          console.log('deleting db entry, twitter says is a duplicate');
          self.remove_and_emit.call(self, tweet);
        } else {
          console.error(err);
          console.error('!! ERROR reposting');
        }
      } else {
        console.log('posted: ' + tweet.to_string());
        self.remove_and_emit.call(self, tweet);
      }
      if (callback && typeof callback === 'function') {
        callback();
      }
    }
  );
};

TCBot.prototype.should_repost = function(tweet) {

  if (tweet.text().match(/\bthanks\b/i)) {
    return false;
  }

  if (tweet.tweet_json.in_reply_to_screen_name === this.own_username) {
    return false;
  }

  // TODO
  // similar tweets (need to log text)
  // overposts (need to log author + date)
  // keep track of why something was vetoed or held?
  // tweet.text().match(/\sRT @\w+/) // non-native RTs

  return false; // short-circuit to queue everything
};

TCBot.prototype.should_veto = function(tweet) {
  if (tweet.is_by(this.own_username)) {
    return true;
  }

  if (tweet.is_native_retweet()) {
    return true;
  }

  return false;
};

TCBot.prototype.start = function() {
  var stream = this.T.stream('statuses/filter', { track: this.term, lang: 'en' });
  console.log('listening for "' + this.term + '"');
  stream.on('tweet', this.term_mentioned.bind(this));
  stream.on('limit', this.limited.bind(this));
};

TCBot.prototype.term_mentioned = function(tweet_json) {
  var tweet = new Tweet(tweet_json);
  console.log('heard: ' + tweet.to_string());

  if (this.should_veto(tweet)) {
    return false;
  }

  if (this.should_repost(tweet)) {
    this.repost(tweet);
  } else {
    this.queue(tweet);
  }
};

if (module) {
  module.exports = TCBot;
}
