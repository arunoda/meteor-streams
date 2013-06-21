createServerStream = function createServerStream(stream, noInsecure) {
  //simulate insecure
  Meteor.Collection.insecure = !noInsecure;
  this[stream + 'Stream'] = new Meteor.Stream(stream);
  emit('return');
}

createClientStream = function createClientStream(stream) {
  Meteor.startup(function() {
    this[stream + 'Stream'] = new Meteor.Stream(stream, function() {
      emit('return');
    });
  });
}