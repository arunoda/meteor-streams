Meteor.Stream = function Stream(name) {
  var self = this;
  var streamName = 'stream-' + name;
  var collection = new Meteor.Collection(streamName);
  var subscription;
  var subscriptionId;

  self._emit = self.emit;

  collection.find({}).observe({
    "added": function(item) {
      if(subscriptionId) {
        self.author = item.author;
        self._emit.apply(self, item.args);    
      } else {
        subscriptionId = item._id;
      }
    }
  });

  subscription = Meteor.subscribe(streamName);

  self.emit = function emit() {
    var args = [];
    for(var key in arguments) {
      args.push(arguments[key]);
    }
    Meteor.call(streamName, subscriptionId, args);
  };

  self.close = function close() {
    subscription.stop();
  };
}

_.extend(Meteor.Stream.prototype, EventEmitter.prototype);
