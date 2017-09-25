#!/usr/bin/env node

var execSync = require('child_process').execSync;
var request = require('../lib/request');
var semver = require('semver');
var terminal = require('../lib/terminal');

var kongVersion;

request.get('http://localhost:8001').then((response) => {
  var version = JSON.parse(response.body).version;
  kongVersion = semver.major(version) + '.' + semver.minor(version);
  terminal.info('Creating Kong API');
  if (kongVersion == '0.9') {
    return request.post('http://localhost:8001/apis', {
      name: 'Kong',
      upstream_url: 'http://localhost:8001',
      request_path: '/kong_with_basic_auth',
      strip_request_path: true
    });
  } else if (kongVersion == '0.10' || kongVersion == '0.11') {
    return request.post('http://localhost:8001/apis', {
      name: 'Kong',
      upstream_url: 'http://localhost:8001',
      uris: ['/kong_with_basic_auth'],
      strip_uri: true
    });
  } else {
    terminal.error('Unsupported Kong version');
    process.exit(1);
  }
}).then((response) => {
  if (response.statusCode != 201) {
    terminal.error("Failed to create Kong API");
    throw response;
  }
  terminal.success('Kong API created');
  return response.body.id;
}, (error) => {
  terminal.error("A Kong gateway running on http://localhost:8001 is necessary to run tests.");
  process.exitCode = 1;
}).then((kongAPIId) => {
  terminal.info('Adding basic auth to Kong API');
  return request.post('http://localhost:8001/apis/' + kongAPIId + '/plugins' , {name: 'basic-auth'});
}).then((response) => {
  if (response.statusCode != 201) {
    terminal.error("Failed to adding basic auth to Kong API");
    throw response;
  }
  terminal.success('Basic auth plugin added');
  terminal.info('Creating consumer');
  return request.post('http://localhost:8001/consumers' , {username: 'test-user'});
}).then((response) => {
  if (response.statusCode != 201) {
    terminal.error("Failed to create Consumer");
    throw response;
  }
  terminal.success('Consumer created');
  terminal.info('Adding basic auth credentials to consumer');
  var consumerId = response.body.id;
  return request.post('http://localhost:8001/consumers/' + consumerId + '/basic-auth' , {
    username: 'test-user',
    password: 'password'
  });
}).then((response) => {
  if (response.statusCode != 201) {
    terminal.error("Failed to adding basic auth credentials to Consumer");
    throw response;
  }
  terminal.success('Basic auth credentials added');

  terminal.info('-------------------');
  terminal.info('-- Running tests --');
  terminal.info('-------------------');
  execSync('node_modules/.bin/jasmine JASMINE_CONFIG_PATH=./jasmine.json', {stdio: 'inherit'});
});
