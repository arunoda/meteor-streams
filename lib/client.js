Meteor.Stream = function Stream(name, remote, callback) {
  if (remote instanceof Function) {
    callback = remote;
    remote = null;
  }

  EV.call(this);

  var self = this;
  var streamName = 'stream-' + name;
  var collection;
  var subscription;
  var subscriptionId;

  var connected = false;
  var pendingEvents = [];

  if (remote)
		collection = new Meteor.Collection(streamName, remote);
	else
		collection = new Meteor.Collection(streamName);

  self._emit = self.emit;

  collection.find({}).observe({
    "added": function(item) {
      if(item.type == 'subscriptionId') {
        subscriptionId = item._id;
        connected = true;
        pendingEvents.forEach(function(args) {
          self.emit.apply(self, args);
        });
        pendingEvents = [];
      } else {
        var context = {};
        context.subscriptionId = item.subscriptionId;
        context.userId = item.userId;
        self._emit.apply(context, item.args);    
      }
    }
  });

  if (remote)
		subscription = remote.subscribe(streamName, callback);
	else
		subscription = Meteor.subscribe(streamName, callback);

  self.emit = function emit() {
    if(connected) {
      Meteor.call(streamName, subscriptionId, arguments);
    } else {
      pendingEvents.push(arguments);
    }
  };

  self.close = function close() {
    subscription.stop();
  };
}

_.extend(Meteor.Stream.prototype, EV.prototype);
