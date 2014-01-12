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

  describe('#url', function() {
    it('should exist', function() {
      expect(tweet.url).toEqual('http://twitter.com/drwxrxrx/status/422139517030502401');
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

  describe('#to_string', function() {
    it('should return a string with stuff in it', function() {
      var text = tweet.to_string();
      expect(text).toMatch(tweet.username);
      expect(text).toMatch(tweet.text);
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
  });

});
