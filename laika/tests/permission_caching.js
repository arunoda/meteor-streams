var assert = require('assert');
require('./common');

suite('Permission Caching', function() {
  test('caching on', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.permissions.write(function() {
        emit('write');
        return true;
      });
      emit('return');
    });

    var readCount = 0;
    server.on('write', function() {
      readCount++;
    });

    client.evalSync(function() {
      helloStream.emit('aa', 10);
      helloStream.emit('aa', 20);
      emit('return');
    });

    setTimeout(function() {
      assert.equal(readCount, 1);
      done();
    }, 200);

  });

  test('caching off', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.permissions.write(function() {
        emit('write');
        return true;
      }, false);
      emit('return');
    });

    var readCount = 0;
    server.on('write', function() {
      readCount++;
    });

    client.evalSync(function() {
      helloStream.emit('aa', 10);
      helloStream.emit('aa', 20);
      emit('return');
    });

    setTimeout(function() {
      assert.equal(readCount, 2);
      done();
    }, 200);

  });

  test('caching off and args - write', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.permissions.write(function(e, v1, v2) {
        emit('write', e, v1, v2);
        return true;
      }, false);
      emit('return');
    });

    server.on('write', function(eventName, val1, val2) {
      assert.equal(eventName, 'aa');
      assert.equal(val1, 10);
      assert.equal(val2, 20);
      done();
    });

    client.evalSync(function() {
      helloStream.emit('aa', 10, 20);
      emit('return');
    });

  });

  test('caching off and args - read', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.permissions.read(function(e, v1, v2) {
        emit('read', e, v1, v2);
        return true;
      }, false);
      emit('return');
    });

    server.on('read', function(eventName, val1, val2) {
      assert.equal(eventName, 'aa');
      assert.equal(val1, 10);
      assert.equal(val2, 20);
      done();
    });

    server.evalSync(function() {
      helloStream.emit('aa', 10, 20);
      emit('return');
    });

  });
});