Meteor.Stream = function Stream(name, callback) {
  EV.call(this);
  
  var self = this;
  var streamName = 'stream-' + name;
  var collection = new Meteor.Collection(streamName);
  var subscription;
  var subscriptionId;

  self._emit = self.emit;

  collection.find({}).observe({
    "added": function(item) {
      if(item.type == 'subscriptionId') {
        subscriptionId = item._id;
      } else {
        var context = {};
        context.subscriptionId = item.subscriptionId;
        context.userId = item.userId;
        self._emit.apply(context, item.args);    
      }
    }
  });

  subscription = Meteor.subscribe(streamName, callback);

  self.emit = function emit() {
    Meteor.call(streamName, subscriptionId, arguments);
  };

  self.close = function close() {
    subscription.stop();
  };
}

_.extend(Meteor.Stream.prototype, EV.prototype);
