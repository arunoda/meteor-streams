---
layout: post
title: How Streams Works
visible: true
---
When we fire an event on the client, let's see what's actually happening behind the scene.

![How Meteor Streams Works](http://i.imgur.com/MX0yZVG.png)

* Once a client `emit` an event first it will reach the [checkpoint](security.html) no 1.
* It will make sure this event and the client can proceed
* After event pass through the checkpoint it will go through a set of filters
* Filters can add/modify and delete the content of the event
* Then it goes through the next checkpoint to see which clients can receive this event 
* After it passed through the checkpoint 2, event will be delivered to the respective clients

> You might wonder, although I have talked here about checkpoints, but I never used any checkpoints in the example. It is because of the `insecure` package. If `insecure` package exists, all the checkpoints are open by default or otherwise closed.