---
layout: post
title: Communication Patterns
visible: true
---

With permissions, meteor streams can be configured to behave in several ways (AKA: Communication Patterns). Let's discover few common patterns.

> Lets assume `insecure` package has been removed

## Global Communication Channel

With this setup,  you can communication between browser clients back and forth. Clients can send events and listen on them. Additionally with permissions you can customize who can write and read from the stream.

Add following content to `global.js`

    stream = new Meteor.Stream('c2c');

    if(Meteor.isClient) {
      //you can emit events and listen to them here
    }

    if(Meteor.isServer) {
      stream.permissions.write(function(userId, eventName) {
        return true;
      });

      stream.permissions.read(function(userId, eventName) {
        return true;
      });
    }

## Streaming Public Page

With this setup, we can send a stream of messages to each connected clients. You can create streaming content page like **Twitter Home** with this.

Add following content to `streaming.js`

    stream = new Meteor.Stream('public');

    if(Meteor.isClient) {
      stream.on('notifications', function(message) {
        $('#message-board').prepend('<li>' + message + '</li>');
      });
    }

    if(Meteor.isServer) {
      stream.permissions.write(function(userId, eventName) {
        return false;
      });

      stream.permissions.read(function(userId, eventName) {
        return true;
      });

      setInterval(function() {
        stream.emit('notifications', 'server generated event');
      }, 1000);
    }

## Streaming Private Page

Add following content to `private.js`

With this setup, we can create a private streaming page for logged in users. This is something like **Twitter Connect** page. Each user has different content.

    stream = new Meteor.Stream('private');

    if(Meteor.isClient) {
      start = function() {
        //assume user is logged-in
        stream.emit('private-page', Meteor.userId());
        stream.on(Meteor.userId(), function(message) {
          $('#message-board').prepend('<li>' + message + '</li>');
        });
      };
    }

    if(Meteor.isServer) {
      stream.permissions.write(function(userId, eventName) {
        return eventName == 'private-page' && userId;
      });

      stream.permissions.read(function(userId, eventName) {
        return userId == eventName;
      });

      stream.on('private-page', function() {
        var self = this;
        var intervalId = setInterval(function() {
          stream.emit(self.userId, 'server generated event for you');
        }, 1000);
        
        this.onDisconnect = function() {
          clearTimeout(intervalId);
        };
      });
    }

> These are just a few patterns possible with Meteor Streams. If you have some interesting pattern. Don't forget to add this page.