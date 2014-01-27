if (!process.env.TWITTER_CONSUMER_KEY) {
  var env = require('node-env-file');
  env('./.env');
}
if (!process.env.TWITTER_CONSUMER_USERNAME) {
  console.error('ENV vars:');
  console.error(process.env);
  throw new Error('missing TWITTER_CONSUMER_USERNAME in env!');
}

require('newrelic');

var twit_secrets = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
};
var db_url = process.env.DATABASE_URL || process.env.HEROKU_POSTGRESQL_NAVY_URL;

var TCBot = require('./tcbot.js');
var Twit = require('twit');
var WebServer = require('./webserver.js');
var pg = require('pg').native;
var Sequelize = require('sequelize');
var sequelize = new Sequelize(db_url, { define: { underscored: true, underscore: true } });

// TODO move to models dir
var Tweet = sequelize.define('tweet', {
  tweet_id_str: Sequelize.STRING,
  text: Sequelize.TEXT,
  author: Sequelize.STRING,
  json: Sequelize.TEXT //Sequelize.JSON
});
var models = {
  Tweet: Tweet
};

var bot = new TCBot({
  T: new Twit(twit_secrets),
  own_username: process.env.TWITTER_CONSUMER_USERNAME, // no @
  term: process.env.TCB_LISTENING_TERM || '@' + process.env.TWITTER_CONSUMER_USERNAME,
  mute: process.env.TCB_MUTE,
  db_client: new pg.Client(db_url),
  models: models
});

var webserver = new WebServer();

bot.on('posted', function(tweet) {
  webserver.tweet_posted(tweet);
});

bot.on('not_posted', function(tweet) {
  webserver.queue_tweet(tweet);
});

webserver.on('tweet_approved', function(tweet) {
  bot.repost(tweet);
});

bot.start();
webserver.start();

