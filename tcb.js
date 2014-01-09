/*

tweet json looks like:
{ created_at: 'Wed Dec 11 04:57:51 +0000 2013',
  id: 410634513723572200,
  id_str: '410634513723572224',
  text: 'Berlin options that are well-meaning on the encirclement: YlSU',
  source: '<a href="http://twitterfeed.com" rel="nofollow">twitterfeed</a>',
  truncated: false,
  in_reply_to_status_id: null,
  in_reply_to_status_id_str: null,
  in_reply_to_user_id: null,
  in_reply_to_user_id_str: null,
  in_reply_to_screen_name: null,
  user:
   { id: 1217548591,
     id_str: '1217548591',
     name: 'MaryBenson',
     screen_name: 'MaryBen00993461',
     location: '',
     url: null,
     description: null,
     protected: false,
     followers_count: 27,
     friends_count: 0,
     listed_count: 0,
     created_at: 'Mon Feb 25 07:15:24 +0000 2013',
     favourites_count: 0,
     utc_offset: null,
     time_zone: null,
     geo_enabled: false,
     verified: false,
     statuses_count: 7228,
     lang: 'en',
     contributors_enabled: false,
     is_translator: false,
     profile_background_color: 'C0DEED',
     profile_background_image_url: 'http://abs.twimg.com/images/themes/theme1/bg.png',
     profile_background_image_url_https: 'https://abs.twimg.com/images/themes/theme1/bg.png',
     profile_background_tile: false,
     profile_image_url: 'http://pbs.twimg.com/profile_images/3335488878/d27b3cb4da866ca0225f6e883c8c70db_normal.jpeg',
     profile_image_url_https: 'https://pbs.twimg.com/profile_images/3335488878/d27b3cb4da866ca0225f6e883c8c70db_normal.jpeg',
     profile_link_color: '0084B4',
     profile_sidebar_border_color: 'C0DEED',
     profile_sidebar_fill_color: 'DDEEF6',
     profile_text_color: '333333',
     profile_use_background_image: true,
     default_profile: true,
     default_profile_image: false,
     following: null,
     follow_request_sent: null,
     notifications: null },
  geo: null,
  coordinates: null,
  place: null,
  contributors: null,
  retweet_count: 0,
  favorite_count: 0,
  entities: { hashtags: [], symbols: [], urls: [], user_mentions: [] },
  favorited: false,
  retweeted: false,
  filter_level: 'medium',
  lang: 'en' }

*/

var TCB = function(config) {
  this.T = config.T;
  this.term = config.term;
}
TCB.prototype.start = function() {
  var stream = this.T.stream('statuses/filter', { track: this.term, lang: 'en' });
  stream.on('tweet', this.term_mentioned.bind(this));
};
TCB.prototype.term_mentioned = function(tweet) {
  if (this.ok_to_post(tweet)) {
    this.log_tweet(tweet);
    this.T.post('statuses/update', { status: this.process_tweet(tweet) }, function(err, reply) { console.log('err'); console.log(err); console.log('reply'); console.log(reply); });
  }
};
TCB.prototype.ok_to_post = function(tweet) {
  return tweet.user &&
    tweet.user.screen_name &&
    tweet.user.screen_name != 'drwxrxrx_dev'
  ;
};
TCB.prototype.log_tweet = function(tweet) {
  if (tweet && tweet.user) {
    console.log('[' + tweet.created_at.substring(0, 19) + '] @' + tweet.user.screen_name + ': "' + tweet.text + '"');
  }
}
TCB.prototype.process_tweet = function(tweet) {
  return '{@' + tweet.user.screen_name + '} ' +
    tweet.text;
}

if (module) {
  module.exports = TCB;
}
