chatStream = new Meteor.Stream('chat');
chatCollection = new Meteor.Collection(null);

chatStream.on('chat', function(message) {
  chatCollection.insert({
    author: this.author,
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
    if(this.author == 'me') {
      return "me";
    } else if(this.author) {
      var username = Session.get('user-' + this.author);
      if(username) {
        return username;
      } else {
        getUsername(this.author);
      }
    } else {
      return this.subscriptionId;
    }
  }
});

Template.chatBox.events({
  "click #send": function() {
    var message = $('#chat-message').val();
    chatCollection.insert({
      author: 'me',
      message: message
    });
    chatStream.emit('chat', message);
     $('#chat-message').val('');
  }
});

function getUsername(id) {
  Meteor.subscribe('user-info', id);
  Deps.autorun(function() {
    var user = Meteor.users.findOne(id);
    if(user) {
      Session.set('user-' + id, user.username);
    }
  });
}
