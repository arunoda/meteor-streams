notifications = new Meteor.Stream('server-notifications');

if (Meteor.isClient) {
  //listen on notifications on the message event
  notifications.on('message', function(message, time) {
    var completeMessage = message + ' @ ' + new Date(time).toString();
    $('#messages').prepend('<div>' + completeMessage + '</div>');
  });

  //simple clear message action
  Template.body.events({
    'click #clear-messages': function() {
      $('#messages').html('');
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
