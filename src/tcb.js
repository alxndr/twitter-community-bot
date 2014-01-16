var Tweet = require('./tweet.js');

var TCB = function(config) {
  this.T = config.T;
  this.db_client = config.db_client;
  this.username = config.username;
  this.at_username = '@' + this.username;

  this.listening_for_term = this.at_username; // what we're listening for
  this.remove_regex = new RegExp('^\\s*' + this.listening_for_term + '\\s+', 'i'); // => /^\s*@username\s+/i

//  if (this.db_client) {
//    this.look_for_tweets();
//  }
};

//TCB.prototype.look_for_tweets = function() {
//  console.log('looking for tweets');
//  var self = this;
//  this.db_client.connect(function(err) {
//    if (err) { return console.error('could not connect to postgres', err); }
//
//    self.db_client.query('SELECT * from tweets', function(err, result) {
//      if (err) { return console.error('error running query', err); }
//
//      console.log('query end called');
//      if (result.rowCount) {
//        console.log('tweets!');
//        console.log(result);
//      } else {
//        console.log('no tweets stored in db');
//      }
//      self.db_client.end();
//    });
//  });
//};

//TCB.prototype.store_in_db = function(tweet) {
//  console.log('store_in_db');
//  var self = this;
//  this.db_client.connect(function(err) {
//    if (err) return console.error('could not connect to postgres', err);
//
//    self.db_client.query(
//      'insert into tweets(author,text,created_at) values($1, $2, $3)',
//      [tweet.user.screen_name, tweet.text, tweet.created_at]
//    ).on('row', function(row) {
//      console.log(row);
//    });
//  });
//};

TCB.prototype.start = function() {
  console.log('---> started');
  var self = this;
  var stream = this.T.stream('statuses/filter', { track: this.listening_for_term }); //, lang: 'en' });
//  console.log(stream);
  console.log('listening for: ' + this.listening_for_term);
//  stream.on('tweet', this.term_mentioned.bind(this));
  stream.on('tweet', function(tweet_json) {
    console.log('incoming tweet!');
    var tweet = new Tweet(tweet_json);
    console.log(tweet.process_text(self.remove_regex));
  });
  console.log('now we play the waiting game');
};

TCB.prototype.term_mentioned = function(tweet_json) {
  console.log('term mentioned!');
  var tweet = new Tweet(tweet_json);
  console.log(tweet.process_text(this.remove_regex));

//  if (!tweet.is_by(this.username)) {
//    this.repost(tweet);
//  }

  console.log('gonna try to store in db');
//  this.store_in_db(tweet);
  console.log('just kidding');
};

TCB.prototype.repost = function(tweet) {
  console.log('NOT REPOSTING');
  var text = tweet.process_text(this.remove_regex);
  return;
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
