Package.describe({
  summary: "Stream Data from Server to Client"
});

Package.on_use(function (api, where) {
  api.add_files(['server.js'], 'server');
  api.add_files(['event_emitter.js'], 'client');
  api.add_files(['client.js'], 'client');
});

Package.on_test(function (api) {
  api.add_files(['index.js', 'test.js'], 'server');
});