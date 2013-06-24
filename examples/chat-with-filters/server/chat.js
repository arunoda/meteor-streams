chatStream = new Meteor.Stream('chat');

chatStream.permissions.write(function() {
  return true;
});

chatStream.permissions.read(function() {
  return true;
});

chatStream.addFilter(function(eventName, args) {
  if(this.userId) {
    var user = Meteor.users.findOne(this.userId);
    return [args[0], user.username];
  } else {
    return args;
  }
});