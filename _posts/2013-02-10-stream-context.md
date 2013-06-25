---
layout: post
title: Stream Context
visible: true
---

When listening to the stream on the server or client, you could be able to access some of the useful information from the listening method. For an example, you can get the `userId` of the sender as follows.

    if(Meteor.isClient) {
      stream = new Meteor.Stream('hello');
      stream.on('message', function(content) {
        var userId = this.userId; 
        console.log('sending user is: ', userId);
      });
    }

As you can see, there are few useful information available in the `this` context variable.

## In the client side listening method
You can see following fields with `this` context.

* **userId** - if the sender is loggedin his userId or otherwise null
* **subscriptionId** - unique id of the sending client

## In the server side listening method
You can see following fields with `this` context.

* **userId** - if the sender is loggedin his userId or otherwise null
* **subscriptionId** - unique id of the sending client
* **onDisconnect** - you can assign a callback to this to get notified after the client get disconnected from the server

## In filters

You can see following fields with `this` context.

* **userId** - if the sender is loggedin his userId or otherwise null
* **subscriptionId** - unique id of the sending client