var EventEmitter = Npm.require('events').EventEmitter;
var util = Npm.require('util');
var Fibers = Npm.require('fibers');

Meteor.Stream = function Stream(name) {
  var self = this;
  var streamName = 'stream-' + name;
  var allowFunction;
  var allowResultCache = true;
  var allowResults = {};

  var events = new EventEmitter();
  events.setMaxListeners(0);

  self._emit = self.emit;
  self.emit = function emit() {
    console.log('dsdsdsd');
    var args = [];
    for(var key in arguments) {
      args.push(arguments[key]);
    }
    emitToSubscriptions(args, null, null);
  };

  self.allow = function allow(func, cache) {
    allowFunction = func;
    if(cache === false) {
      allowResultCache = false;
    }
  };
  
  function emitToSubscriptions(args, subscriptionId, author) {
    events.emit('item', {args: args, author: author, subscriptionId: subscriptionId});
  }

  Meteor.publish(streamName, function() {
    var subscriptionId = Random.id();
    var publication = this;

    //send subscription id as the first document
    publication.added(streamName, subscriptionId);
    publication.ready();
    events.on('item', onItem);

    function onItem(item) {
      Fibers(function() {
        var id = Random.id();
        if(allowSendingToClient(publication.userId, item.args[0])) {
          //do not send again this to the sender
          if(subscriptionId != item.subscriptionId) {
            publication.added(streamName, id, item);
            publication.removed(streamName, id);
          }
        }
      }).run();
    }

    publication.onStop(function() {
      console.log('onStop');
      events.removeListener('item', onItem);
    });
  });

  var methods = {};
  methods[streamName] = function(subscriptionId, args) {
    self.userId = this.userId;
    Fibers(function() {
      self._emit.apply(self, args);
      emitToSubscriptions(args, subscriptionId, self.userId);
    }).run();
  };
  Meteor.methods(methods);

  function allowSendingToClient(userId, eventName) {
    var namespace = userId + '-' + eventName;
    var result = allowResults[namespace];
    
    if(result === undefined) {
      console.log('checking....');
      result = !allowFunction || allowFunction(userId, eventName);
      if(allowResultCache) {
          allowResults[namespace] = result;
      }
    }
    return result;
  }
};

util.inherits(Meteor.Stream, EventEmitter);
