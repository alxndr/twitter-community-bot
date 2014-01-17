if (!process.env.TWITTER_CONSUMER_KEY) {
  var env = require('node-env-file');
  env('./.env');
}
var secrets = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
};

var TCB = require('./tcb.js');
var Twit = require('twit');
var WebServer = require('./server.js');

var term = '@drwxrxrx_dev'; // TODO take from env
var twit = new Twit(secrets);

var bot = new TCB({ T: twit, term: term });
var webserver = new WebServer();

bot.on('posted', function(tweet) {
  webserver.emit('posted', tweet);
});

webserver.on('approved', function(tweet) {
  bot.emit('post', tweet);
});

bot.start();
webserver.start();

