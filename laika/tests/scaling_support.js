var assert = require('assert');
require('./common');

suite('Scaling Support', function() {
  test('trigger a client using .emitToSubscriptions()', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    client.evalSync(function() {
      helloStream.on('evt', function(data) {
        emit('evt', data, this);
      });
      emit('return');
    });

    client.on('evt', function(data, context) {
      assert.deepEqual(data, {a: 10});
      assert.deepEqual(context, {subscriptionId: 'subscriptionId', userId: 'userId'});
      done();
    });

    server.evalSync(function() {
      helloStream.emitToSubscriptions(['evt', {a: 10}], 'subscriptionId', 'userId');
    });
  });

  test('listen to all events with firehose', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    client.evalSync(laika.actions.createUser, {username: 'arunoda', password: 'password'});
    var user = client.evalSync(laika.actions.loggedInUser);

    server.evalSync(function() {
      helloStream.firehose = function(args, subscriptionId, userId) {
        emit('firehose', args, subscriptionId, userId);
      };
      emit('return');
    });

    server.on('firehose', function(args, subscriptionId, userId) {
      assert.deepEqual(args, ['evt', {a: 100}]);
      assert.equal(userId, user._id);
      assert.ok(subscriptionId);
      done();
    }); 

    client.evalSync(function() {
      helloStream.emit('evt', {a: 100});
      emit('return');
    });
  });
});