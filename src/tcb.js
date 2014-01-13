var Tweet = require('./tweet.js');

var TCB = function(config) {
  this.T = config.T;
  this.term = config.term;
  this.db_client = config.db_client;
  this.username = 'drwxrxrx_dev'; // TODO find a better way to do this
  this.username_regex = new RegExp('^\\s*@' + this.username + '\\s+');
  if (this.db_client) {
    this.look_for_tweets();
  }
};
TCB.prototype.look_for_tweets = function() {
  console.log('connecting');
  var self = this;
  this.db_client.connect(function(err) {
    if (err) { return console.error('could not connect to postgres', err); }

    self.db_client.query('SELECT * from tweets', function(err, result) {
      if (err) { return console.error('error running query', err); }

      console.log('query end called');
      if (result.rowCount) {
        console.log('tweets!');
        console.log(result);
      } else {
        console.log('no tweets stored in db');
      }
      self.db_client.end();
    });
  });
};
TCB.prototype.store_in_db = function(tweet) {
  var self = this;
  this.db_client.connect(function(err) {
    if (err) return console.error('could not connect to postgres', err);

    self.db_client.query(
      'insert into tweets(author,text,created_at) values($1, $2, $3)',
      [tweet.user.screen_name, tweet.text, tweet.created_at]
    ).on('row', function(row) {
      console.log(row);
    });
  });
};
TCB.prototype.start = function() {
  var stream = this.T.stream('statuses/filter', { track: this.term, lang: 'en' });
  stream.on('tweet', this.term_mentioned.bind(this));
};
TCB.prototype.term_mentioned = function(tweet_json) {
  var tweet = new Tweet(tweet_json);

  if (!tweet.is_by(this.username)) {
    this.repost(tweet);
  }

  this.store_in_db(tweet);
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
};

if (module) {
  module.exports = TCB;
}
