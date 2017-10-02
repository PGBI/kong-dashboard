#!/usr/bin/env node

var execSync = require('child_process').execSync;
var terminal = require('../lib/terminal');

try {
  terminal.info('------------------------');
  terminal.info('-- Bootstrapping Kong --');
  terminal.info('------------------------');
  execSync('tests/bootstrap.js', {stdio: 'inherit'});

  terminal.info('------------------------');
  terminal.info('-- Starting webdriver --');
  terminal.info('------------------------');
  execSync('node_modules/.bin/webdriver-manager update', {stdio: 'inherit'});
  execSync('node_modules/.bin/webdriver-manager start --detach', {stdio: 'inherit'});

  terminal.info('-------------------');
  terminal.info('-- Running tests --');
  terminal.info('-------------------');
  execSync('node_modules/.bin/protractor tests/conf.js', {stdio: 'inherit'});

  terminal.info('------------------------');
  terminal.info('-- Stopping webdriver --');
  terminal.info('------------------------');
  execSync('node_modules/.bin/webdriver-manager shutdown');

} catch (ex) {
  console.log(ex);
  process.exit(1);
}
