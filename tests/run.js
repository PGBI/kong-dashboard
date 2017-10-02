#!/usr/bin/env node

var execSync = require('child_process').execSync;
var spawn    = require('child_process').spawn;
var terminal = require('../lib/terminal');

try {
  terminal.info('------------------------');
  terminal.info('-- Bootstrapping Kong --');
  terminal.info('------------------------');
  execSync('tests/bootstrap.js', {stdio: 'inherit'});

  terminal.info('------------------------');
  terminal.info('-- Updating webdriver --');
  terminal.info('------------------------');
  execSync('node_modules/.bin/webdriver-manager update', {stdio: 'inherit'});

  terminal.info('-------------------');
  terminal.info('-- Running tests --');
  terminal.info('-------------------');
  execSync('node_modules/.bin/protractor tests/conf.js', {stdio: 'inherit'});

} catch (ex) {
  console.log(ex);
  process.exit(1);
}
