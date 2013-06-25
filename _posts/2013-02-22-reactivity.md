---
layout: post
title: Reactivity
visible: true
---

By default Meteor Streams does not have any reactive capabilities. But using it with local only collections, we can get some form of reactivity.

In the following example, we'll try render server generated notifications using reactive collections.

Add following content to `home.html`

<script src="https://gist.github.com/arunoda/7b70cc66f9e8118c7660.js">
</script>

Add following content to `reactive-streams.js`. See inline comments for more information.

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

