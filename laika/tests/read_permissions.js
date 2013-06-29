var assert = require('assert');
require('./common');

suite('Read Permissions', function() {
  test('server to client allowed', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.permissions.read(function(eventName) {
        return true;
      });
      emit('return');
    });

    client.evalSync(function() {
      helloStream.on('evt', function(data) {
        emit('evt', data)
      });
      emit('return');
    });

    client.on('evt', function(data) {
      assert.deepEqual(data, {aa: 10});
      done();
    });

    server.evalSync(function() {
      helloStream.emit('evt', {aa: 10});
      emit('return');
    });

  });

  test('server to client denied', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    var received = 0;

    server.evalSync(function() {
      helloStream.permissions.read(function(eventName) {
        return false;
      });
      emit('return');
    });

    client.evalSync(function() {
      helloStream.on('evt', function(data) {
        emit('evt', data)
      });
      emit('return');
    });

    client.on('evt', function(data) {
      received++;
    });

    server.evalSync(function() {
      helloStream.emit('evt', {aa: 10});
      emit('return');
    });

    setTimeout(function() {
      assert.equal(received, 0);
      done();
    }, 100);

  });

  test('ignore permissions with insecure', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    client.evalSync(function() {
      helloStream.on('evt', function(data) {
        emit('evt', data)
      });
      emit('return');
    });

    client.on('evt', function(data) {
      assert.deepEqual(data, {aa: 10});
      done();
    });

    server.evalSync(function() {
      helloStream.emit('evt', {aa: 10});
      emit('return');
    });

  });

  test('ignore permissions without insecure', function(done, server, client) {
    server.evalSync(createServerStream, 'hello', true);
    client.evalSync(createClientStream, 'hello');

    var received = 0;

    client.evalSync(function() {
      helloStream.on('evt', function(data) {
        emit('evt', data)
      });
      emit('return');
    });

    client.on('evt', function(data) {
      received++;
    });

    server.evalSync(function() {
      helloStream.emit('evt', {aa: 10});
      emit('return');
    });

    setTimeout(function() {
      assert.equal(received, 0);
      done();
    }, 100);
  });

  test('server to client with logged in user', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.permissions.read(function(eventName) {
        return !!this.userId;
      });
      emit('return');
    });

    client.evalSync(laika.actions.createUser, {username: 'arunoda', password: 'abc'});

    client.evalSync(function() {
      helloStream.on('evt', function(data) {
        emit('evt', data)
      });
      emit('return');
    });

    client.on('evt', function(data) {
      assert.deepEqual(data, {aa: 10});
      done();
    });

    server.evalSync(function() {
      helloStream.emit('evt', {aa: 10});
      emit('return');
    });

  });
});