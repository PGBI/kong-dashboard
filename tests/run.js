#!/usr/bin/env node

var execSync = require('child_process').execSync;
var spawn    = require('child_process').spawn;
var terminal = require('../lib/terminal');
var request = require('../lib/request');
var semver = require('semver');

terminal.info('------------------------');
terminal.info('-- Updating webdriver --');
terminal.info('------------------------');
execSync('node_modules/.bin/webdriver-manager update', {stdio: 'inherit'});

terminal.info('-------------------');
terminal.info('-- Running tests --');
terminal.info('-------------------');
request.get('http://localhost:8001').then((response) => {
  var version = JSON.parse(response.body).version;
  kongVersion = semver.major(version) + '.' + semver.minor(version);
  var maxRetryAttempts = process.env.TRAVIS ? 2 : 0;
  runTests(maxRetryAttempts);
}).catch((error) => {
  process.exit(1);
});


function runTests(attemptsLeft) {
  try {
    return execSync('KONG_VERSION=' + kongVersion + ' node_modules/.bin/protractor tests/conf.js', {stdio: 'inherit'});
  }
  catch (error) {
    console.log('Tests failed. ' + attemptsLeft + ' attempts remaining.');
    if (attemptsLeft <= 0) {
      throw error;
    }
    return runTests(attemptsLeft - 1);
  }
}
