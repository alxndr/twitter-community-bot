/* global module, require */

var moment = require('moment');

// TODO convert to revealing module pattern
var Tweet = function(tweet_json) {
  this.tweet_json = tweet_json;
  this.id_str = this.tweet_json.id_str; // number is too big for js ints
  this.username = tweet_json.user.screen_name;
  this.url = this.determine_url();
  this.processed_text = this.process_text();
  this.display_date = moment(this.tweet_json.created_at).format('D MMM YYYY hh:mm ZZ');
};

Tweet.prototype.data_for_db = function() {
  return {
    tweet_id_str: this.get_id_str(),
    author: this.get_author(),
    text: this.text(),
    tweet_date: this.get_date(),
    original_tweet_json: this.tweet_json
  };
};

Tweet.prototype.determine_url = function() {
  return 'http://twitter.com/' + this.username + '/status/' + this.id_str;
};

Tweet.prototype.get_author = function() {
  return this.tweet_json.user.screen_name;
};

Tweet.prototype.get_date = function() {
  return this.tweet_json.created_at;
};

Tweet.prototype.get_id_str= function() {
  return this.tweet_json.id_str;
};

Tweet.prototype.is_by = function(name) {
  return this.username === name;
};

Tweet.prototype.is_native_retweet = function() {
  // n.b. none of these are the property we want:
  // in_reply_to_screen_name: "If the represented Tweet is a reply, this field will contain the screen name of the original Tweet's author"
  // in_reply_to_status_id_str: "If the represented Tweet is a reply, this field will contain the string representation of the original Tweet's ID"
  // retweet_count: "Number of times this Tweet has been retweeted"
  // retweeted: "Indicates whether this Tweet has been retweeted by the authenticating user"

  if (this.tweet_json.retweeted_status) {
    return true;
  }
  return false;
};

Tweet.prototype.process_text = function(username_regex) {
  var tweet_text = this.tweet_json.text.replace(username_regex, '');
  var new_tweet_text = '{@' + this.tweet_json.user.screen_name + '} ' + tweet_text;
  if (new_tweet_text.length > 140) {
    var truncated_new_tweet = new_tweet_text.substring(0, new_tweet_text.length - (this.url.length + 7));
    new_tweet_text = truncated_new_tweet + '… link: ' + this.url;
  }
  return new_tweet_text;
};

Tweet.prototype.text = function() {
  return this.tweet_json.text;
};

Tweet.prototype.to_string = function() {
  return '[' +
    this.tweet_json.created_at.substring(0, 19) +
    '] @' +
    this.tweet_json.user.screen_name +
    ': "' +
    this.tweet_json.text +
    '"';
};

if (module) {
  module.exports = Tweet;
}
