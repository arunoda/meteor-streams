notifications = new Meteor.Stream('server-notifications');

if (Meteor.isClient) {
  //create a client only collection
  notificationCollection = new Meteor.Collection(null);

  //listen to the stream and add to the collection
  notifications.on('message', function(message, time) {
    notificationCollection.insert({
      message: message,
      time: time
    });
  });

  //render template with the collection
  Template.body.helpers({
    'messages': function() {
      return notificationCollection.find();
    },

    'dateString': function() {
      return new Date(this.time).toString();
    }
  });

  //simple clear message action
  Template.body.events({
    'click #clear-messages': function() {
      notificationCollection.remove({});
    }
  });
}

if (Meteor.isServer) {
  //allow any connected client to listen on the stream
  notifications.permissions.read(function(userId, eventName) {
    return true;
  });

  //notify clients with a message per every second
  setInterval(function() {
    notifications.emit('message', 'Server Generated Message', Date.now());
  }, 1000);
}
