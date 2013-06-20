var assert = require('assert');

function createServerStream(stream) {
  //simulate insecure
  Meteor.Collection.insecure = true;
  this[stream + 'Stream'] = new Meteor.Stream(stream);
  emit('return');
}

function createClientStream(stream) {
  this[stream + 'Stream'] = new Meteor.Stream(stream);
  emit('return');
}

suite('Basic Communication', function() {
  test('server to client', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    client.evalSync(function() {
      helloStream.on('evt', function(data) {
        emit('evt', data);
      });
      emit('return');
    });

    client.on('evt', function(data) {
      assert.deepEqual(data, {abc: 10});
      done();
    });

    server.evalSync(function() {
      helloStream.emit('evt', {abc: 10});
      emit('return');
    });
  });

  test('client to server', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.on('evt2', function(d1, d2) {
        emit('evt2', d1, d2);
      });
      emit('return');
    });

    server.on('evt2', function(d1, d2) {
      assert.deepEqual(d1, {abc: 1001});
      assert.equal(d2, 200);
      done();
    });

    client.evalSync(function() {
      helloStream.emit('evt2', {abc: 1001}, 200);
      emit('return');
    });
  });

  test('client to client', function(done, server, c1, c2) {
    server.evalSync(createServerStream, 'hello');
    c1.evalSync(createClientStream, 'hello');
    c2.evalSync(createClientStream, 'hello');

    c1.evalSync(function() {
      helloStream.on('evt', function(data) {
        emit('evt', data);
      });
      emit('return');
    });

    c1.on('evt', function(data) {
      assert.deepEqual(data, {abc: 10012});
      done();
    });

    c2.evalSync(function() {
      helloStream.emit('evt', {abc: 10012});
      emit('return');
    });
  });
});