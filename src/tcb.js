var Tweet = require('./tweet.js');

var TCB = function(config) {
  this.T = config.T;
  this.term = config.term;
  this.username = 'drwxrxrx_dev'; // todo find a better way to do this
  this.username_regex = new RegExp('^\\s*@' + this.username + '\\s+');
}
TCB.prototype.start = function() {
  var stream = this.T.stream('statuses/filter', { track: this.term, lang: 'en' });
  stream.on('tweet', this.term_mentioned.bind(this));
};
TCB.prototype.term_mentioned = function(tweet_json) {
  var tweet = new Tweet(tweet_json);
  if (!tweet.is_by(this.username)) {
    this.repost(tweet);
  }
};
TCB.prototype.repost = function(tweet) {
  var text = tweet.process_text(this.username_regex);
  this.T.post(
    'statuses/update',
    { status: text },
    function(err, reply) {
      if (err) {
        console.error('repost received error');
        console.error(err);
      } else {
        console.log('posted: ' + text);
      }
    }
  );
}

if (module) {
  module.exports = TCB;
}
