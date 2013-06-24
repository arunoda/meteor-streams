var assert = require('assert');
require('./common');

suite('Filters', function() {
  test('adding an arg', function(done, server, c1, c2) {
    server.evalSync(createServerStream, 'hello');
    c1.evalSync(createClientStream, 'hello');
    c2.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.addFilter(function(eventName, args) {
        return [args[0], 'injected'];
      });
      emit('return');
    });

    c1.evalSync(function() {
      helloStream.on('evt', function(v1, v2) {
        emit('evt', v1, v2);
      });
      emit('return');
    });

    c1.on('evt', function(v1, v2) {
      assert.deepEqual(v1, {aa: 10});
      assert.deepEqual(v2, 'injected');
      done();
    });

    c2.evalSync(function() {
      helloStream.emit('evt', {aa: 10});
      emit('return');
    });
  });

  test('adding an arg - multiple filters', function(done, server, c1, c2) {
    server.evalSync(createServerStream, 'hello');
    c1.evalSync(createClientStream, 'hello');
    c2.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.addFilter(function(eventName, args) {
        args.push('i1');
        return args;
      });

      helloStream.addFilter(function(eventName, args) {
        args.push('i2');
        return args;
      });
      emit('return');
    });

    c1.evalSync(function() {
      helloStream.on('evt', function(v1, v2, v3) {
        emit('evt', v1, v2, v3);
      });
      emit('return');
    });

    c1.on('evt', function(v1, v2, v3) {
      assert.deepEqual(v1, {aa: 10});
      assert.deepEqual(v2, 'i1');
      assert.deepEqual(v3, 'i2');
      done();
    });

    c2.evalSync(function() {
      helloStream.emit('evt', {aa: 10});
      emit('return');
    });
  });

  test('modifying an arg', function(done, server, c1, c2) {
    server.evalSync(createServerStream, 'hello');
    c1.evalSync(createClientStream, 'hello');
    c2.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.addFilter(function(eventName, args) {
        args[0].bb = 200;
        return args;
      });
      emit('return');
    });

    c1.evalSync(function() {
      helloStream.on('evt', function(v1) {
        emit('evt', v1);
      });
      emit('return');
    });

    c1.on('evt', function(v1) {
      assert.deepEqual(v1, {aa: 10, bb: 200});
      done();
    });

    c2.evalSync(function() {
      helloStream.emit('evt', {aa: 10});
      emit('return');
    });
  });

  test('userId and subscriptionId', function(done, server, c1) {
    var userId = c1.evalSync(function() {
      Accounts.createUser({username: 'arunoda', password: '11234343'}, function(err) {
        emit('return', Meteor.userId());
      });
    });

    server.evalSync(createServerStream, 'hello');
    c1.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.addFilter(function(eventName, args) {
        emit('filter', this.userId, this.subscriptionId);
        return args;
      });
      emit('return');
    });

    server.on('filter', function(_userId, _subscriptionId) {
      assert.equal(_userId, userId);
      assert.ok(_subscriptionId);
      done();
    });

    c1.evalSync(function() {
      helloStream.emit('evt', {aa: 10});
      emit('return');
    });
  });
}); 