var Tweet = function(tweet_json) {
  this.tweet_json = tweet_json;
  this.id_str = this.tweet_json.id_str; // number is too big for js ints
  this.username = tweet_json.user.screen_name;
  this.url = this.determine_url();
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
  var new_tweet_text = '{@' + this.tweet_json.user.screen_name + '} ' + tweet_text;
  if (new_tweet_text.length > 140) {
    var truncated_new_tweet = new_tweet_text.substring(0, new_tweet_text.length - (this.url.length + 7));
    new_tweet_text = truncated_new_tweet + '… link: ' + this.url;
  }
  return new_tweet_text;
};

Tweet.prototype.to_html = function() {
  var html = [];
  html.push('<span class="tweet">');
  html.push(  '<span class="user">@' + this.tweet_json.user.screen_name + '</span>');
  html.push(  '<span class="text">' + this.tweet_json.text + '</span>');
  html.push(  '<span class="date">' + this.tweet_json.created_at.substring(0, 19) + '</span>');
  html.push('</span>');
  return html.join(' ');
};

Tweet.prototype.is_by = function(name) {
  return this.username === name;
};

Tweet.prototype.is_native_retweet = function() {
  // in_reply_to_status_id_str is for "replies"
  if (this.retweeted_status) {
    return true;
  }
  return false;
}

Tweet.prototype.text = function() {
  return this.tweet_json.text;
};

// private

Tweet.prototype.determine_url = function() {
  return 'http://twitter.com/' + this.username + '/status/' + this.id_str;
};

if (module) {
  module.exports = Tweet;
}
