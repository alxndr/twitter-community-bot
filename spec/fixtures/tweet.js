/*
json response for https://twitter.com/drwxrxrx/status/422139517030502401
as of Jan 2014
*/
var tweet_json = {
  created_at: 'Sat Jan 11 22:54:38 +0000 2014',
  id: 422139517030502400,
  id_str: '422139517030502401',
  text: '@drwxrxrx_dev foo baz',
  source: '<a href="http://itunes.apple.com/us/app/twitter/id409789998?mt=12" rel="nofollow">Twitter for Mac</a>',
  truncated: false,
  in_reply_to_status_id: null,
  in_reply_to_status_id_str: null,
  in_reply_to_user_id: 2240148025,
  in_reply_to_user_id_str: '2240148025',
  in_reply_to_screen_name: 'drwxrxrx_dev',
  user: {
    id: 15149293,
    id_str: '15149293',
    name: 'alexander',
    screen_name: 'drwxrxrx',
    location: 'Oaktown, CA',
    url: 'http://lyrem-ipsum.com',
    description: '$ echo ceci n\\\'est pas une pipe | sed -Ee \'s/(eci n|pas )//g\'',
    protected: false,
    followers_count: 114,
    friends_count: 383,
    listed_count: 6,
    created_at: 'Tue Jun 17 19:22:13 +0000 2008',
    favourites_count: 13,
    utc_offset: -28800,
    time_zone: 'Pacific Time (US & Canada)',
    geo_enabled: false,
    verified: false,
    statuses_count: 741,
    lang: 'en',
    contributors_enabled: false,
    is_translator: false,
    profile_background_color: '000000',
    profile_background_image_url: 'http://abs.twimg.com/images/themes/theme14/bg.gif',
    profile_background_image_url_https: 'https://abs.twimg.com/images/themes/theme14/bg.gif',
    profile_background_tile: true,
    profile_image_url: 'http://pbs.twimg.com/profile_images/55574382/AatTHNGVBD_normal.jpg',
    profile_image_url_https: 'https://pbs.twimg.com/profile_images/55574382/AatTHNGVBD_normal.jpg',
    profile_link_color: '704709',
    profile_sidebar_border_color: '000000',
    profile_sidebar_fill_color: '999999',
    profile_text_color: '333333',
    profile_use_background_image: true,
    default_profile: false,
    default_profile_image: false,
    following: null,
    follow_request_sent: null,
    notifications: null
  },
  geo: null,
  coordinates: null,
  place: null,
  contributors: null,
  retweet_count: 0,
  favorite_count: 0,
  entities: {
    hashtags: [],
    symbols: [],
    urls: [],
    user_mentions: [ [Object] ]
  },
  favorited: false,
  retweeted: false,
  filter_level: 'medium',
  lang: 'tr'
};

if (module) {
  module.exports = tweet_json;
}
