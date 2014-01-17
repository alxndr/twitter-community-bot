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

var TCBot = require('./bot.js');
var Twit = require('twit');
var WebServer = require('./server.js');

var bot = new TCBot({
  T: new Twit(secrets),
  own_username: process.env.TWITTER_CONSUMER_USERNAME, // no @
  term: process.env.TCB_LISTENING_TERM || '@' + process.env.TWITTER_CONSUMER_USERNAME,
  mute: process.env.TCB_MUTE
});

var webserver = new WebServer();

bot.on('posted', function(tweet) {
  webserver.emit('posted', tweet);
});

//webserver.on('approved', function(tweet) {
//  bot.emit('post', tweet);
//});

bot.start();
webserver.start();

