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
    });
    afterEach(function() {
      delete(TCBot);
    });

    describe('when by ourself', function() {
      beforeEach(function() {
        TCBot.__get__('Tweet').andReturn({
          to_string: jasmine.createSpy('Tweet#to_string'),
          is_by: function() { return true; }
        });
        spyOn(bot, 'should_repost');
        spyOn(bot, 'repost');
        spyOn(bot, 'queue');
      });
      it('should not do anything', function() {
        bot.term_mentioned();

        expect(bot.should_repost).not.toHaveBeenCalled();
        expect(bot.repost).not.toHaveBeenCalled();
        expect(bot.queue).not.toHaveBeenCalled();
      });
    });

    describe('when not by ourself', function() {
      beforeEach(function() {
        TCBot.__get__('Tweet').andReturn({
          is_by: function() { return false; },
          to_string: function() {},
          data_for_db: function() {}
        });
        spyOn(bot, 'should_repost');
        spyOn(bot, 'repost');
        spyOn(bot, 'queue');
      });

      it('should create a tweet object', function() {
        bot.term_mentioned();

        expect(TCBot.__get__('Tweet')).toHaveBeenCalled();
      });

      describe('when we can repost', function() {
        beforeEach(function() {
          bot.should_repost.andReturn(true);
        });
        it('should call repost', function() {
          bot.term_mentioned();

          expect(bot.repost).toHaveBeenCalled();
          expect(bot.queue).not.toHaveBeenCalled();
        });
      });

      describe('when we cannot repost', function() {
        beforeEach(function() {
          bot.should_repost.andReturn(false);
        });
        it('should queue the tweet', function() {
          bot.term_mentioned();

          expect(bot.repost).not.toHaveBeenCalled();
          expect(bot.queue).toHaveBeenCalled();
        });
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
          it('should temporarily always be false', function() {
            expect(bot.should_repost(tweet)).toBeFalsy();
          });
          xit('should allow thanksgiving chatter', function() {
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

});
