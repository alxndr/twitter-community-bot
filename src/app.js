var secrets = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
};

var Twit = require('twit');
var twit = new Twit(secrets);

var TCB = require('./tcb.js');

var Server = require('./server.js');

new Server().start();

var term = '@drwxrxrx_dev';
var tcb = new TCB({ T: twit, term: term });
tcb.start();

