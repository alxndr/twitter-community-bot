var env = require('node-env-file');
var Postgres = require('pg');
var TCB = require('./tcb.js');
var Twit = require('twit');
//var WebServer = require('./server.js');

env('./.env');

var secrets = {
  consumer_key       : process.env.TWITTER_CONSUMER_KEY,
  consumer_secret    : process.env.TWITTER_CONSUMER_SECRET,
  access_token       : process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
};

var client = new Postgres.Client('postgres://postgres:1234@localhost/tcb');
var twit = new Twit(secrets);
var username = process.argv[2]; // TODO options parser?

//new WebServer().start();

new TCB({
  T: twit,
  username: username,
  db_client: client
}).start();
