var EE = require('events').EventEmitter;
var Tweet = require('./tweet.js');

var TCBot = function(config) {
  this.T = config.T;
  this.own_username = config.own_username;
  this.term = config.term;
  this.mute = config.mute;
  if (!this.mute) {
    console.log('posting as ' + this.own_username);
  }
  this.trim_regex = new RegExp('^\\s*@' + this.own_username + '\\s+');
  console.log('trimming off ' + this.trim_regex);

  this.tweet_queue = [];
};

// extend TCBot with EventEmitter
TCBot.prototype = new EE();

TCBot.prototype.start = function() {
  var stream = this.T.stream('statuses/filter', { track: this.term, lang: 'en' });
  console.log('listening for "' + this.term + '"');
  stream.on('tweet', this.term_mentioned.bind(this));
};

TCBot.prototype.term_mentioned = function(tweet_json) {
  var tweet = new Tweet(tweet_json);

  if (this.should_repost(tweet)) {
    console.log('heard: ' + tweet.to_string());
    this.repost(tweet);
  }
};

TCBot.prototype.should_repost = function(tweet) {
  if (tweet.is_by(this.own_username)) {
    // TODO be nice to have twit/twitter filter us out for us
    return false;
  }

  // TODO
  // retweets
  // thanks
  // similar tweets
  // overposts

  return true;
};

TCBot.prototype.repost = function(tweet) {
  var self = this;
  if (this.mute) {
    console.log('MUTE');
    self.emit('posted', tweet);
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
      } else {
        var tweet = new Tweet(tweet_json);
        console.log('posted: ' + tweet.to_string());
        self.emit('posted', tweet);
      }
    }
  );
};

if (module) {
  module.exports = TCBot;
}
