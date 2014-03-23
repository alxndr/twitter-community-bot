/* global require, jasmine, describe, xdescribe, it, expect, beforeEach, afterEach, spyOn */
/* jshint -W051 */

var rewire = require('rewire');
var WebServer = rewire('../src/webserver.js');

describe('WebServer', function() {
  var webserver;
  beforeEach(function() {
    webserver = new WebServer({});
  });
  afterEach(function() {
    delete webserver;
  });

  describe('#all_tweets', function() {
    beforeEach(function() {
      webserver.TweetModel = jasmine.createSpyObj('TweetModel', ['find']);
    });
    it('should call find on our TweetModel', function() {
      webserver.all_tweets();

      expect(webserver.TweetModel.find).toHaveBeenCalled();
    });
    xdescribe('find callback');
  });

  describe('#approve', function() {
    beforeEach(function() {
      spyOn(webserver, 'emit');
    });

    it('emits tweet_approved', function() {
      webserver.approve('the tweet', 'a callback');

      expect(webserver.emit).toHaveBeenCalledWith('tweet_approved', 'the tweet', 'a callback');
    });
  });

  describe('record_to_tweet_instance', function() {
    beforeEach(function() {
      WebServer.__set__({ Tweet : jasmine.createSpy('Tweet spy') });
    });
    it('should create a new Tweet with json', function() {
      webserver.record_to_tweet_instance({original_tweet_json: {tweet:'json'}});

      expect(WebServer.__get__('Tweet')).toHaveBeenCalledWith({tweet:'json'});
    });
  });

  xdescribe('#render_home', function() {
    // TODO split out callback
  });

  describe('#repost_and_redirect', function() {
    var fake_request;

    beforeEach(function() {
      fake_request = {params:{}};
      webserver.TweetModel = jasmine.createSpyObj('TweetModel', ['findOne']);
    });
    afterEach(function() {
      delete fake_request;
    });

    it('should find the tweet', function() {
      webserver.repost_and_redirect(fake_request);

      expect(webserver.TweetModel.findOne).toHaveBeenCalled();
    });

    describe('findOne callback', function() {
      beforeEach(function() {
        spyOn(webserver, 'record_to_tweet_instance').andReturn(
          jasmine.createSpyObj('fake tweet', ['to_string'])
        );
        spyOn(webserver, 'approve');
      });

      it('should approve the tweet', function() {
        webserver.TweetModel.findOne.andCallFake(function(conditions, callback) {
          callback(undefined, {});
        });

        webserver.repost_and_redirect(fake_request);

        expect(webserver.approve).toHaveBeenCalled();
      });

      xdescribe('callback to #approve');
    });

  });

  describe('#update_queued_tweets', function() {
    beforeEach(function() {
      webserver.TweetModel = jasmine.createSpyObj('TweetModel', ['find']);
    });

    it('should find a TweetModel', function() {
      webserver.update_queued_tweets();

      expect(webserver.TweetModel.find).toHaveBeenCalled();
    });

    it('should call the callback once the tweet is found', function() {
      var cb = jasmine.createSpy('callback passed to update_queued_tweets');
      webserver.TweetModel.find.andCallFake(function(find_done_handler) {
        find_done_handler(undefined, []);
      });
      webserver.update_queued_tweets(cb);

      expect(cb).toHaveBeenCalledWith();
    });
  });

});
