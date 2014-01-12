var secrets = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
};

var db = new pg.Client(process.env.DATABASE_URL || 'something').connect();
var query = client.query('SELECT * FROM mytable');
query.on('end', function() { db.end(); });

var TCB = require('./tcb.js');
var Twit = require('twit');
var WebServer = require('./server.js');

var term = '@drwxrxrx_dev'; // TODO take from env
var twit = new Twit(secrets);

new TCB({ T: twit, term: term }).start();
new WebServer().start();
