/* global require, jasmine, spyOn, describe, it, expect, beforeEach, afterEach, xdescribe, xit */
/* jshint -W051 */

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

  xdescribe('#queue', function() {
  });

  describe('#remove_and_emit', function() {
    var tweet;
    beforeEach(function() {
      tweet = jasmine.createSpyObj('Tweet instance', ['to_string']);
      bot.TweetModel = jasmine.createSpyObj('TweetModel', ['findOneAndRemove']);
      bot.TweetModel.findOneAndRemove.andReturn();
    });

    it('should find and remove a tweet from the db', function() {
      bot.remove_and_emit(tweet);

      expect(bot.TweetModel.findOneAndRemove).toHaveBeenCalled();
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
        var tweet = jasmine.createSpyObj('tweet', ['to_string']);
        bot.repost(tweet);
        expect(bot.T.post).not.toHaveBeenCalled();
      });
    });

    describe('when not mute', function() {
      var tweet;

      beforeEach(function() {
        delete(bot.mute);
        tweet = jasmine.createSpyObj('tweet', ['process_text', 'to_string']);
        tweet.process_text.andReturn('foo bar');
      });
      afterEach(function() {
        delete tweet;
      });

      it('should process text', function() {
        bot.repost(tweet);

        expect(tweet.process_text).toHaveBeenCalledWith(bot.trim_regex);
      });

      it('should post', function() {
        bot.repost(tweet);

        expect(bot.T.post).toHaveBeenCalledWith( 'statuses/update', { status: 'foo bar' }, jasmine.any(Function));
      });

      xdescribe('with a callback', function() {
        // pending... split out T.post handler
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
    describe('when thanks', function() {
      beforeEach(function() {
        tweet.text = jasmine.createSpy().andReturn('foo thanks bar');
        tweet.tweet_json = {in_reply_to_screen_name: 'foo'};
      });
      it('should be false', function() {
        expect(bot.should_repost(tweet)).toBeFalsy();
      });
    });
    describe('when not thanks', function() {
      beforeEach(function() {
        tweet.text = jasmine.createSpy().andReturn('foo bar');
        tweet.tweet_json = {in_reply_to_screen_name: 'foo'};
      });
      it('should temporarily always be false', function() {
        expect(bot.should_repost(tweet)).toBeFalsy();
      });
      xit('should allow thanksgiving chatter', function() {
        tweet.text = jasmine.createSpy('is_by').andReturn('i am thankful that thanksgiving is tasty');
        expect(bot.should_repost(tweet)).toBeTruthy();
      });
    });
  });

  describe('#should_veto', function() {
    var tweet;
    beforeEach(function() {
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
        expect(bot.should_veto(tweet)).toBeTruthy();
      });
    });
    describe('when tweet not by self', function() {
      beforeEach(function() {
        tweet.is_by = jasmine.createSpy('is_by').andReturn(false);
      });
      describe('when tweet is a native RT', function() {
        beforeEach(function() {
          tweet.is_native_retweet = jasmine.createSpy('is_native_retweet').andReturn(true);
        });
        it('should be true', function() {
          expect(bot.should_veto(tweet)).toBeTruthy();
        });
      });
      describe('when tweet not native RT', function() {
        beforeEach(function() {
          tweet.is_native_retweet = jasmine.createSpy('is_native_retweet').andReturn(false);
        });
        it('should be false', function() {
          expect(bot.should_veto(tweet)).toBeFalsy();
        });
      });
    });
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

  describe('#term_mentioned', function() {
    beforeEach(function() {
      TCBot.__set__({ Tweet : jasmine.createSpy('Tweet spy') });
      spyOn(bot, 'should_repost');
      spyOn(bot, 'repost');
      spyOn(bot, 'queue');
    });
    afterEach(function() {
      delete(TCBot);
    });

    describe('when veto-able', function() {
      beforeEach(function() {
        TCBot.__get__('Tweet').andReturn({
          to_string: jasmine.createSpy('Tweet#to_string')
        });
        spyOn(bot, 'should_veto').andReturn(true);
      });
      it('should do nothing', function() {
        expect(bot.term_mentioned()).toBeFalsy();

        expect(bot.should_repost).not.toHaveBeenCalled();
        expect(bot.repost).not.toHaveBeenCalled();
        expect(bot.queue).not.toHaveBeenCalled();
      });
    });

    describe('when not veto-able', function() {
      beforeEach(function() {
        TCBot.__get__('Tweet').andReturn({
          to_string: jasmine.createSpy('Tweet#to_string')
        });
        spyOn(bot, 'should_veto').andReturn(false);
      });
      describe('when should repost', function() {
        beforeEach(function() {
          bot.should_repost.andReturn(true);
        });
        it('should repost', function() {
          bot.term_mentioned();

          expect(bot.repost).toHaveBeenCalled();
          expect(bot.queue).not.toHaveBeenCalled();
        });
      });

      describe('when should not repost', function() {
        beforeEach(function() {
          bot.should_repost.andReturn(false);
        });

        it('should queue', function() {
          bot.term_mentioned();

          expect(bot.repost).not.toHaveBeenCalled();
          expect(bot.queue).toHaveBeenCalled();
        });
      });
    });
  });

});
