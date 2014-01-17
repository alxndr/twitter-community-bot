var TCBot = require('../src/bot.js');

describe('TCBot', function() {
  var bot;
  beforeEach(function() {
    bot = new TCBot({});
  });
  afterEach(function() {
    delete(bot);
  });

  describe('#start', function() {
    it('should set up a stream', function() {
      bot.T = jasmine.createSpyObj('T', ['stream']);
      bot.T.stream.andReturn({on: jasmine.createSpy('T.stream.on')});
      bot.start();
      expect(bot.T.stream).toHaveBeenCalled();
      expect(bot.T.stream().on).toHaveBeenCalled();
    });
  });

  xdescribe('#term_mentioned', function() {
    it('should create a tweet object');

    describe('when tweet is not by username', function() {
      it('should repost');
    });

    describe('when tweet is by username', function() {
      it('should not repost');
    });
  });

  describe('#repost', function() {
    beforeEach(function() {
      bot.T = jasmine.createSpyObj('T', ['post']);
    });
    afterEach(function() {
      delete(bot.T);
    });

    describe('when mute', function() {
      beforeEach(function() {
        bot.mute = 'true';
      });
      it('should not post', function() {
        bot.repost();
        expect(bot.T.post).not.toHaveBeenCalled();
      });
    });

    describe('when not mute', function() {
      beforeEach(function() {
        delete(bot.mute);
      });
      it('should process text', function() {
        var tweet = jasmine.createSpyObj('tweet', ['process_text']);
        tweet.process_text.andReturn('foo bar');
        bot.repost(tweet);
        expect(tweet.process_text).toHaveBeenCalledWith(bot.trim_regex);
      });
      it('should post', function() {
        var tweet = jasmine.createSpyObj('tweet', ['process_text']);
        tweet.process_text.andReturn('foo bar');
        bot.repost(tweet);
        expect(bot.T.post).toHaveBeenCalledWith(
          'statuses/update'
          ,{ status: 'foo bar' }
          ,jasmine.any(Function)
        );
      });
    });
  });

});
