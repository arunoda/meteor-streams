Package.describe({
  summary: "DB less realtime communication for meteor"
});

Package.on_use(function (api, where) {
  api.add_files(['lib/ev.js', 'lib/server.js', 'lib/stream_permission.js'], 'server');
  api.add_files(['lib/ev.js', '/lib/client.js'], 'client');
});
