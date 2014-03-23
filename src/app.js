/* global process, require, console */

require('newrelic');

if (!process.env.TWITTER_CONSUMER_KEY) {
  var env = require('node-env-file');
  env('./.env');
}
if (!process.env.TWITTER_CONSUMER_USERNAME) {
  console.error('ENV vars:');
  console.error(process.env);
  throw new Error('missing TWITTER_CONSUMER_USERNAME in env!');
}

var twit_secrets = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
};

var TCBot = require('./tcbot.js');
var Twit = require('twit');
var WebServer = require('./webserver.js');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/twitter_community_bot');
var tweet_schema = mongoose.Schema({
  tweet_id_str: String,
  author: String,
  text: String,
  tweet_date: Date,
  original_tweet_json: Object
});
var TweetModel = mongoose.model('Tweet', tweet_schema);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'db connection error:'));
db.once('open', function() { console.log('db connection opened ok'); });

var bot = new TCBot({
  db: db,
  TweetModel: TweetModel,
  T: new Twit(twit_secrets),
  own_username: process.env.TWITTER_CONSUMER_USERNAME, // no @
  term: process.env.TCB_LISTENING_TERM || '@' + process.env.TWITTER_CONSUMER_USERNAME,
  mute: process.env.TCB_MUTE
});

var webserver = new WebServer({
  db: db,
  TweetModel: TweetModel,
  listening_for: bot.term,
  posting_as: bot.own_username
});

/*
bot.on('posted', function(tweet) {
  webserver.tweet_posted(tweet);
});

bot.on('not_posted', function(tweet) {
  webserver.queue_tweet(tweet);
});
*/

webserver.on('tweet_approved', function(tweet, callback) {
  console.log('app heard tweet_approved, telling bot to repost');
  bot.repost(tweet, callback);
});

bot.start();
webserver.start();

