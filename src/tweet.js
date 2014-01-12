var Tweet = function(tweet_json) {
  this.tweet_json = tweet_json;
  this.id_str = this.tweet_json.id_str; // number is too big for js ints
  this.username = tweet_json.user.screen_name;
  this.url = this.determine_url();
}
Tweet.prototype.determine_url = function() {
  var url = 'http://twitter.com/' + this.username + '/status/' + this.id_str;
  return url;
}
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
}
Tweet.prototype.process_text = function(username_regex) {
  var tweet_text = this.tweet_json.text.replace(username_regex, '');
  var new_tweet = '{@' + this.tweet_json.user.screen_name + '} ' + tweet_text;
  if (new_tweet.length > 140) {
    var truncated_new_tweet = new_tweet.substring(0, new_tweet.length - (this.url.length + 9));
    new_tweet = truncated_new_tweet + '... link: ' + this.url;
  }
  return new_tweet;
}

if (module) {
  module.exports = Tweet;
}
