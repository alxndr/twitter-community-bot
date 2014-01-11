/*
tweet json that we care about looks like:
{
  created_at: 'Wed Dec 11 04:57:51 +0000 2013',
  text: 'Berlin options that are well-meaning on the encirclement: YlSU',
  user: {
     screen_name: 'MaryBen00993461',
     lang: 'en',
  },
  lang: 'en'
}
*/

var TCB = require('../tcb.js');

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

    xit('should do stuff on tweet', function() {
      tcb.T = {
        stream: function() {
          return jasmine.createSpyObj('stream', ['on']);
        }
      };
      tcb.start();
      expect(tcb.T.stream.on).toHaveBeenCalledWith('tweet', jasmine.any(Function));
    });
  });
});
