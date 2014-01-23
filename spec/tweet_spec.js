var Tweet = require('../src/tweet.js');
var tweet_json = require('./fixtures/tweet.js');

describe('Tweet', function() {
  var tweet;
  beforeEach(function() {
    tweet = new Tweet(tweet_json);
  });
  afterEach(function() {
    delete(tweet);
  });

  describe('.url', function() {
    it('should exist', function() {
      expect(tweet.url).toEqual('http://twitter.com/drwxrxrx/status/422139517030502401');
    });
  });

  describe('#determine_url', function() {
    it('should put together username and id_str', function() {
      expect(tweet.determine_url()).toEqual('http://twitter.com/drwxrxrx/status/422139517030502401');
    });
  });

  describe('#is_by', function() {
    beforeEach(function() {
      tweet.username = 'foo';
    });

    describe('when tweet author is passed in', function() {
      it('should return true', function() {
        expect(tweet.is_by('foo')).toBeTruthy();
      });
    });

    describe('when other author is passed in', function() {
      it('should return false', function() {
        expect(tweet.is_by('bar')).toBeFalsy();
      });
    });
  });

  describe('#is_native_retweet', function() {
    describe('when retweeted_status is present', function() {
      beforeEach(function() {
        tweet.retweeted_status = {some:'object'};
      });
      it('should return true', function() {
        expect(tweet.is_native_retweet()).toBeTruthy();
      });
    });

    describe('when retweeted_status is not', function() {
      beforeEach(function() {
        delete(tweet.retweeted_status);
      });
      it('should return false', function() {
        expect(tweet.is_native_retweet()).toBeFalsy();
      });
    });
  });

  describe('#to_string', function() {
    it('should return a string with stuff in it', function() {
      var text = tweet.to_string();
      expect(text).toMatch(tweet.username);
      expect(text).toMatch(tweet.text);
      // also timestamp
    });
  });

  describe('#process_text', function() {
    var processed;
    beforeEach(function() {
      processed = tweet.process_text(/@drwxrxrx_dev /); // TODO don't like that regex
    });
    it('should put username in braces at beginning', function() {
      expect(processed).toMatch(/^{@drwxrxrx} /);
    });
    it('should remove passed regex', function() {
      expect(processed).not.toMatch(/@drwxrxrx_dev /);
    });

    describe('when reprocessed text is over 140 chars', function() {
      beforeEach(function() {
        tweet.tweet_json.text = 'Li lingues differe solmen in li grammatica, li pronunciation e li plu commun vocabules. Omnicos directe al desirabilite de un nov lingua franca: On refusa continuar payar custosi traductores.';
      });
      it('should truncate with link', function() {
        expect(tweet.process_text(/foo/)).toEqual('{@drwxrxrx} Li lingues differe solmen in li grammatica, li pronunciation e li plu commun vocabules. Omnicos directe al desirabilite de un nov l… link: http://twitter.com/drwxrxrx/status/422139517030502401');
      });
    });
  });


});
