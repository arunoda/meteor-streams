---
layout: post
title: Introduction
visible: true
---

When we are talking about meteor and realtime, mongodb comes to the scene by default. It is really good model and works really well. But do we really need mongodb for all our realtime communications? Obviously, answer should be NO.

But with meteor, we tend to design our app with mongodb since it is the only way. Mongodb is good, and we need it, but what we really need is a hybrid approach. For some of our realtime communications we can use mongo, for some we'll do it without mongo. But how?

## Introducing Meteor Streams

Meteor Stream is a distributed EventEmitter across meteor. It can be managed with filters and has a good security model (Inherited from existing meteor security model). You can create as many as streams you want, and it is independent from mongo.

With Meteor Streams, you can communicate between

 * client to clients
 * server to clients
 * client to server
 * server to servers

## Lets give it a try

Let's create a simple browser console based chat app.

 * Create a simple meteor application with `meteor hello-streams`
 * Install meteor streams from atmosphere `mrt add streams`

Add following content to `chat.js`

    chatStream = new Meteor.Stream('chat');

    if(Meteor.isClient) {
      sendChat = function(message) {
        chatStream.emit('message', message);
        console.log('me: ' + message);
      };

      chatStream.on('message', function(message) {
        console.log('user: ' + message);
      });
    }

Now you can use `sendChat(messageText)` method to chat in the browser console. Isn't it simple?

> Read [how streams works](how-streams-works.html) or [checkout some examples](examples.html)