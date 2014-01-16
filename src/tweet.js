var Tweet = function(tweet_json) {
  this.tweet_json = tweet_json;
  this.id_str = this.tweet_json.id_str; // keep a string, bc the numerical value is too big for js ints
  this.username = tweet_json.user.screen_name;
  this.url = this.determine_url();
};

Tweet.prototype.determine_url = function() {
  return 'http://twitter.com/' + this.username + '/status/' + this.id_str;
};

Tweet.prototype.is_by = function(name) {
  return this.username == name;
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

Tweet.prototype.process_text = function(username_regex) {
  var tweet_text = this.tweet_json.text.replace(username_regex, '');
  var processed_tweet_text = '{@' + this.tweet_json.user.screen_name + '} ' + tweet_text;
  if (processed_tweet_text.length > 140) {
    // TODO extract
    var truncated_text = processed_tweet_text.substring(0, processed_tweet_text.length - (this.url.length + 9));
    processed_tweet_text = truncated_text + '... link: ' + this.url;
  }
  return processed_tweet_text;
};

Tweet.prototype.is_repostable = function(config) {
  if (this.is_by(config.exclude_username)) {
    return false;
  }
  return true;
};

if (module) {
  module.exports = Tweet;
}
