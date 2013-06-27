Meteor.startup(function() {
  Meteor.Cluster.init();
  Meteor.Cluster.sync(chatStream);
});