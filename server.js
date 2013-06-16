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
    var args = [];
    for(var key in arguments) {
      args.push(arguments[key]);
    }
    emitToSubscriptions(args, null, null);
  };

  self.permissions = new Meteor.Stream.Permission(Meteor.Collection.insecure, true);
  
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
        if(self.permissions.checkPermission('read', publication.userId, item.args[0])) {
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
    //in order to send this to the server callback
    self.userId = this.userId;
    Fibers(function() {
      //in order to send this to the serve callback
      self.allowed = self.permissions.checkPermission('write', self.userId, args[0]);
      //need to send this to server always
      self._emit.apply(self, args);
      if(self.allowed) {
        emitToSubscriptions(args, subscriptionId, self.userId);
      }
    }).run();
  };
  Meteor.methods(methods);
};

util.inherits(Meteor.Stream, EventEmitter);

Meteor.Stream.Permission = function (acceptAll, cacheAll) {

  var options = {
    "read": {
      results: {}
    }, 
    "write": {
      results: {}
    }
  };

  this.read = function(func, cache) {
    options['read']['func'] = func;
    options['read']['doCache'] = (cache === undefined)? cacheAll: cache; 
  };

  this.write = function(func, cache) {
    options['write']['func'] = func;
    options['write']['doCache'] = (cache === undefined)? cacheAll: cache; 
  };

  this.checkPermission = function(type, userId, eventName) {
    var namespace = userId + '-' + eventName;
    var result = options[type].results[namespace];
    
    if(result === undefined) {
      var func = options[type].func;
      if(func) {
        result = func(userId, eventName);
        if(options[type].doCache) {
          options[type].results[namespace] = result;
          return result;
        }
      } else {
        return acceptAll;
      }
    } else {
      return result;
    }
  };  
}
