var assert = require('assert');
require('./common');

suite('onDisconnect Handlers', function() {
  test('single handler', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.on('start', function() {
        this.onDisconnect = function() {
          emit('disconnect');
        };
      });
      emit('return');
    });

    server.on('disconnect', function() {
      done();
    });

    client.evalSync(function() {
      helloStream.emit('start');
      setTimeout(function() {
        helloStream.close();
      }, 50);
      emit('return');
    });
  });

  test('multiple handlers', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      var cnt = 0;
      helloStream.on('start', function() {
        var id = ++cnt;
        this.onDisconnect = function() {
          emit('disconnect', id);
        };
      });
      emit('return');
    });

    var disconnectCount = 0;
    server.on('disconnect', function(id) {
      disconnectCount++;
    });

    client.evalSync(function() {
      helloStream.emit('start');
      helloStream.emit('start');
      setTimeout(function() {
        helloStream.close();
        emit('return');
      }, 50);
    });

    setTimeout(function() {
      assert.equal(disconnectCount, 2);
      done();
    }, 50);
  });

  test('without any handler', function(done, server, client) {
    server.evalSync(createServerStream, 'hello');
    client.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      helloStream.on('start', function() {
        emit('recieved');
      });
      emit('return');
    });

    server.on('recieved', function() {
      done();
    });

    client.evalSync(function() {
      helloStream.emit('start');
      setTimeout(function() {
        helloStream.close();
      }, 50);
      emit('return');
    });
  });

  test('2 clients first one uses a handler', function(done, server, c1, c2) {
    server.evalSync(createServerStream, 'hello');
    c1.evalSync(createClientStream, 'hello');
    c2.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      var clientOneReceived = false;
      helloStream.on('start', function() {
        if(!clientOneReceived) {
          clientOneReceived = true;
          this.onDisconnect = function() {
            emit('disconnect');
          };
        }
      });
      emit('return');
    });

    var disconnectCount = 0;
    server.on('disconnect', function() {
      disconnectCount++;
    });

    c1.evalSync(function() {
      helloStream.emit('start');
      setTimeout(function() {
        helloStream.close();
        emit('return');
      }, 50);
    });

    c2.evalSync(function() {
      helloStream.emit('start');
      setTimeout(function() {
        helloStream.close();
        emit('return');
      }, 50);
    });

    setTimeout(function() {
      assert.equal(disconnectCount, 1);
      done();
    }, 50);
  });

  test('2 clients both uses a handlers', function(done, server, c1, c2) {
    server.evalSync(createServerStream, 'hello');
    c1.evalSync(createClientStream, 'hello');
    c2.evalSync(createClientStream, 'hello');

    server.evalSync(function() {
      var clientOneReceived = false;
      helloStream.on('start', function() {
        clientOneReceived = true;
        this.onDisconnect = function() {
          emit('disconnect');
        };
      });
      emit('return');
    });

    var disconnectCount = 0;
    server.on('disconnect', function() {
      disconnectCount++;
    });

    c1.evalSync(function() {
      helloStream.emit('start');
      setTimeout(function() {
        helloStream.close();
        emit('return');
      }, 50);
    });

    c2.evalSync(function() {
      helloStream.emit('start');
      setTimeout(function() {
        helloStream.close();
        emit('return');
      }, 50);
    });

    setTimeout(function() {
      assert.equal(disconnectCount, 2);
      done();
    }, 50);
  });
});