var rewire = require('rewire');

var TCBot = rewire('../src/tcbot.js');

describe('TCBot', function() {
  var bot;
  beforeEach(function() {
    bot = new TCBot({});
  });
  afterEach(function() {
    delete(bot);
  });

  describe('#start', function() {
    beforeEach(function() {
      bot.T = jasmine.createSpyObj('T', ['stream']);
      bot.T.stream.andReturn({on: jasmine.createSpy('T.stream.on')});
      bot.db_client = jasmine.createSpyObj('db_client', ['connect', 'query']);
    });
    it('should set up a stream', function() {
      bot.start();
      expect(bot.T.stream).toHaveBeenCalled();
      expect(bot.T.stream().on).toHaveBeenCalled();
    });
    it('should connect to the db', function() {
      bot.start();
      expect(bot.db_client.connect).toHaveBeenCalled();
    });
  });

  describe('#term_mentioned', function() {
    beforeEach(function() {
      TCBot.__set__({
        Tweet : jasmine.createSpy('Tweet spy')
      });
      TCBot.__get__('Tweet').andReturn({
        to_string: function(){}
      });
    });
    afterEach(function() {
      delete(TCBot);
    });

    describe('when we can repost', function() {
      beforeEach(function() {
        spyOn(bot, 'should_repost').andReturn(true);
        spyOn(bot, 'repost');
      });
      it('should create a tweet object', function() {
        bot.term_mentioned();
        expect(TCBot.__get__('Tweet')).toHaveBeenCalled();
      });
      it('should call repost', function() {
        bot.term_mentioned();
        expect(bot.repost).toHaveBeenCalled();
      });
    });

    describe('when we cannot repost', function() {
      beforeEach(function() {
        spyOn(bot, 'should_repost').andReturn(false);
      });
      it('should create a tweet object', function() {
        bot.term_mentioned();
        expect(TCBot.__get__('Tweet')).toHaveBeenCalled();
      });
      it('should not call repost', function() {
        spyOn(bot, 'repost');
        bot.term_mentioned();
        expect(bot.repost).not.toHaveBeenCalled();
      });
    });
  });

  describe('#should_repost', function() {
    var tweet;
    beforeEach(function() {
      bot.own_username = 'foo';
      tweet = {};
    });
    afterEach(function() {
      delete(tweet);
    });
    describe('when tweet is by self', function() {
      beforeEach(function() {
        tweet.is_by = jasmine.createSpy('is_by').andReturn(true);
      });
      it('should be false', function() {
        expect(bot.should_repost(tweet)).toBeFalsy();
      });
    });
    describe('when tweet is not by self', function() {
      beforeEach(function() {
        tweet.is_by = jasmine.createSpy('is_by').andReturn(false);
        tweet.text = jasmine.createSpy('is_by').andReturn('');
      });
      describe('when tweet is a native RT', function() {
        beforeEach(function() {
          tweet.is_native_retweet = jasmine.createSpy('is_native_retweet').andReturn(true);
        });
        it('should be false', function() {
          expect(bot.should_repost(tweet)).toBeFalsy();
        });
      });
      describe('when tweet is not RT', function() {
        beforeEach(function() {
          tweet.is_native_retweet = jasmine.createSpy('is_native_retweet').andReturn(false);
        });
        describe('when thanks', function() {
          beforeEach(function() {
            tweet.text = jasmine.createSpy('is_by').andReturn('foo thanks bar');
          });
          it('should be false', function() {
            expect(bot.should_repost(tweet)).toBeFalsy();
          });
        });
        describe('when not thanks', function() {
          beforeEach(function() {
            tweet.text = jasmine.createSpy('is_by').andReturn('foo bar');
          });
          it('should be true', function() {
            expect(bot.should_repost(tweet)).toBeTruthy();
          });
          it('should allow thanksgiving chatter', function() {
            tweet.text = jasmine.createSpy('is_by').andReturn('i am thankful that thanksgiving is tasty');
            expect(bot.should_repost(tweet)).toBeTruthy();
          });
        });
      });
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
