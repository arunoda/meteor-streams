var assert = require('assert');
require('./common');

suite('Write Permissions', function() {
  test('client to server with granted', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.permissions.write(function(userId, evt) {
        return true;
      });
      helloStream.on('evt', function(data) {
        emit('evt', this.userId, this.allowed, data);
      });
      emit('return');
    });

    server.on('evt', function(userId, allowed, data) {
      assert.equal(userId, null);
      assert.equal(allowed, true);
      assert.deepEqual(data, {aa: 100});
      done();
    });

    client.evalSync(function() {
      helloStream.emit('evt', {aa: 100});
      emit('return');
    });
  });

  test('client to server with granted logged in okay', function(done, server, c1, c2) {
    server.evalSync(createServerStream, 'hello');
    c1.evalSync(createClientStream, 'hello');
    c2.evalSync(createClientStream, 'hello');

    c1.evalSync(laika.actions.createUser, {username: 'arunoda', password: 'maxapower'});

    server.evalSync(function() {
      helloStream.permissions.write(function(userId, evt) {
        return !!userId;
      });
      helloStream.on('evt', function(data) {
        emit('evt', this.userId, this.allowed, data);
      });
      emit('return');
    });

    var users = 0;
    server.on('evt', function(userId, allowed, data) {
      if(users == 0) {
        assert.ok(userId);
        assert.equal(allowed, true);
        assert.deepEqual(data, {aa: 100});
        users ++;
      } else {
        assert.ok(!userId);
        assert.equal(allowed, false);
        assert.deepEqual(data, {bb: 100});
        done();
      }
    });

    c1.evalSync(function() {
      helloStream.emit('evt', {aa: 100});
      emit('return');
    });

    c2.evalSync(function() {
      helloStream.emit('evt', {bb: 100});
      emit('return');
    });
  });

  test('client to server with denied', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.permissions.write(function(userId, evt) {
        return false;
      });
      helloStream.on('evt', function(data) {
        emit('evt', this.userId, this.allowed, data);
      });
      emit('return');
    });

    server.on('evt', function(userId, allowed, data) {
      assert.equal(userId, null);
      assert.equal(allowed, false);
      assert.deepEqual(data, {aa: 100});
      done();
    });

    client.evalSync(function() {
      helloStream.emit('evt', {aa: 100});
      emit('return');
    });
  });

  test('client to server with ignore with insecure', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.on('evt', function(data) {
        emit('evt', this.userId, this.allowed, data);
      });
      emit('return');
    });

    server.on('evt', function(userId, allowed, data) {
      assert.equal(userId, null);
      assert.equal(allowed, true);
      assert.deepEqual(data, {aa: 100});
      done();
    });

    client.evalSync(function() {
      helloStream.emit('evt', {aa: 100});
      emit('return');
    });
  });

  test('client to server with ignore without insecure', function(done, server, client) {
    server.evalSync(createServerStream, 'hello', true);
    client.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.on('evt', function(data) {
        emit('evt', this.userId, this.allowed, data);
      });
      emit('return');
    });

    server.on('evt', function(userId, allowed, data) {
      assert.equal(userId, null);
      assert.equal(allowed, false);
      assert.deepEqual(data, {aa: 100});
      done();
    });

    client.evalSync(function() {
      helloStream.emit('evt', {aa: 100});
      emit('return');
    });
  });

  test('client to client with granted', function(done, server, c1, c2) {
    server.evalSync(createServerStream, 'hello');
    c1.evalSync(createClientStream, 'hello');
    c2.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.permissions.write(function(userId, evt) {
        return true;
      });
      emit('return');
    });

    c1.evalSync(function() {
      helloStream.on('evt', function(data) {
        emit('evt', data);
      });
      emit('return');
    });

    c1.on('evt', function(data) {
      assert.deepEqual(data, {aa: 10});
      done();
    });

    c2.evalSync(function() {
      helloStream.emit('evt', {aa: 10});
      emit('return');
    });

  });

  test('client to client with denied', function(done, server, c1, c2) {
    server.evalSync(createServerStream, 'hello');
    c1.evalSync(createClientStream, 'hello');
    c2.evalSync(createClientStream, 'hello');

    var received = 0;

    server.evalSync(function() {
      helloStream.permissions.write(function(userId, evt) {
        return false;
      });
      emit('return');
    });

    c1.evalSync(function() {
      helloStream.on('evt', function(data) {
        emit('evt', data);
      });
      emit('return');
    });

    c1.on('evt', function(data) {
      received++;
    });

    c2.evalSync(function() {
      helloStream.emit('evt', {aa: 10});
      emit('return');
    });

    setTimeout(function() {
      assert.equal(received, 0);
      done();
    }, 100);

  });
});