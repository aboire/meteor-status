Package.describe({
  name: '255kb:meteor-status',
  version: '1.5.0',
  summary: 'Meteor Status automatically alerts users when the connection to the server has been lost.',
  git: 'https://github.com/255kb/meteor-status',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.versionsFrom(['2.3', '3.0']);
  api.use(['ecmascript', 'templating', 'tracker', 'reactive-var'], 'client');
  api.addFiles(['client/meteor-status.css'], 'client');
  api.mainModule('client/meteor-status.js', 'client');
});