console.log(process.title + ' ' + process.version);
console.log(process);
var env = require('node-env-file');
env('./.env');

var secrets = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
};

//console.log('secrets');
//console.log(secrets);

var TCB = require('./tcb.js');
var Twit = require('twit');
var WebServer = require('./server.js');
var pg = require('pg');

var conString = "postgres://postgres:1234@localhost/tcb";
var client = new pg.Client(conString);
console.log('client');
console.log(client);
console.log('client');

var term = '@drwxrxrx_dev'; // TODO take from env. process.argv[2] or find an options parser
var twit = new Twit(secrets);

new TCB({ T: twit, term: term, db_client: client }).start();

new WebServer().start();

