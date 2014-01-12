var TCB = require('../src/tcb.js');

describe('TCB', function() {
  var tcb;
  beforeEach(function() {
    tcb = new TCB({});
  });
  afterEach(function() {
    delete(tcb);
  });

  describe('#start', function() {
    it('should set up a stream', function() {
      tcb.T = jasmine.createSpyObj('T', ['stream']);
      tcb.T.stream.andReturn({on: jasmine.createSpy('T.stream.on')});
      tcb.start();
      expect(tcb.T.stream).toHaveBeenCalled();
      expect(tcb.T.stream().on).toHaveBeenCalled();
    });
  });

  xdescribe('#term_mentioned', function() {
    it('should create a tweet object', function() {
    });
  });

  describe('#repost', function() {
    beforeEach(function() {
      tcb.T = jasmine.createSpyObj('T', ['post']);
    });
    afterEach(function() {
      delete(tcb.T);
    });
    it('should post processed text', function() {
      var tweet = jasmine.createSpyObj('tweet', ['process_text']);
      tweet.process_text.andReturn('foo bar');
      tcb.repost(tweet);
      expect(tweet.process_text).toHaveBeenCalledWith(tcb.username_regex);
      expect(tcb.T.post).toHaveBeenCalledWith(
        'statuses/update'
        ,{ status: 'foo bar' }
        ,jasmine.any(Function)
      );
    });
  });

});
