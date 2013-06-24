var assert = require('assert');
require('../../lib/ev.js');

suite('EV', function() {
  test('on and emit', function(done) {
    var ev = new EV();
    var cnt = 0;
    ev.on('evt', function(v1, v2) {
      cnt ++;
      assert.equal(v1, 10);
      assert.equal(v2, 20);
    }); 
    ev.emit('evt', 10, 20);
    ev.emit('evt', 10, 20);
    
    assert.equal(cnt, 2);
    done();
  });

  test('removeListener', function(done) {
    var ev = new EV();
    var cnt = 0;
    ev.on('evt', evtCallback);
    function evtCallback(v1, v2) {
      cnt ++;
      assert.equal(v1, 10);
      assert.equal(v2, 20);
    } 
    ev.emit('evt', 10, 20);
    ev.removeListener('evt', evtCallback);
    ev.emit('evt', 10, 20);
    
    assert.equal(cnt, 1);
    done();
  });

  test('removeAllListener', function(done) {
    var ev = new EV();
    var cnt = 0;
    ev.on('evt', evtCallback);
    ev.on('evt2', evtCallback);
    function evtCallback(v1, v2) {
      cnt ++;
      assert.equal(v1, 10);
      assert.equal(v2, 20);
    } 
    ev.emit('evt', 10, 20);
    ev.emit('evt2', 10, 20);
    ev.removeAllListeners('evt');
    ev.emit('evt', 10, 20);
    ev.emit('evt2', 10, 20);
    
    assert.equal(cnt, 3);
    done();
  });

  test('once and emit', function(done) {
    var ev = new EV();
    var cnt = 0;

    ev.once('evt', function(v1, v2) {
      cnt++;
      assert.equal(v1, 10);
      assert.equal(v2, 20);
    });

    ev.emit('evt', 10, 20);
    ev.emit('evt', 10, 20);

    assert.equal(cnt, 1);
    done();
  });

  test('emit with different contexts', function(done) {
    var ev1 = new EV();
    var ev2 = new EV();
    var ids = [];

    ev1.on('evt', function() {
      ids.push(this.id);
    });

    ev2.on('evt', function() {
      ids.push(this.id);
    });  

    ev1.emit.apply({id: 1}, ['evt']);
    ev2.emit.apply({id: 2}, ['evt']); 

    assert.deepEqual(ids, [1, 2]);
    done();
  });
});