chatStream = new Meteor.Stream('chat');
chatCollection = new Meteor.Collection(null);

chatStream.on('chat', function(message, username) {
  chatCollection.insert({
    username: username,
    subscriptionId: this.subscriptionId,
    message: message
  });
});

Template.chatBox.helpers({
  "messages": function() {
    return chatCollection.find();
  }
});


var subscribedUsers = {};

Template.chatMessage.helpers({
  "user": function() {
    return (this.username)? this.username: this.subscriptionId;
  }
});

Template.chatBox.events({
  "click #send": function() {
    var message = $('#chat-message').val();
    chatCollection.insert({
      username: 'me',
      message: message
    });
    chatStream.emit('chat', message);
     $('#chat-message').val('');
  }
});
