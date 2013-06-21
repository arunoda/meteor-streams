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
});