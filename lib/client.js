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
        self.subscriptionId = item.subscriptionId;
        self.author = item.author;
        self._emit.apply(self, item.args);    
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
