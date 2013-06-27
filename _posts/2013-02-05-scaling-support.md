---
layout: post
title: Scaling Support
visible: true
---

If you decided to scale your app horizontally, by default Meteor Streams works within a single instance only. As an example lets say you are going to have 3 meteor instances (A, B, C). Now events emitted from instance A cannot be listen from B or C.

But simply integrating [Meteor Cluster](https://github.com/arunoda/meteor-cluster) you can remove this limitation. See below for the integration.

> We assume your app runs on locally, and a local [redis-server](http://redis.io) is running. See [here](http://meteorhacks.com/meteor-cluster-introduction-and-how-it-works.html) for advanced Meteor Cluster configuration.

* Add `cluster` smart package with `mrt add cluster` 
* Sync streams with `cluster` as shown below

Add following content to `cluster.js`

    if(Meteor.isServer) {
      Meteor.startup(function() {
        Meteor.Cluster.init();
        //stream1, stream2 are the Meteor Streams available on your app
        Meteor.Cluster.sync(stream1, stream2);
      });
    }

* Now you can start as many as meteor instances you want

## Notes

* [Introduction to Meteor Cluster](http://meteorhacks.com/meteor-cluster-introduction-and-how-it-works.html)
* [How to scale and load balance your meteor app](http://meteorhacks.com/load-balancing-your-meteor-app.html)
