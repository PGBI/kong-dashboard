#!/usr/bin/env node

var execSync = require('child_process').execSync;

try {
  execSync('pwd', {stdio: 'inherit'});
  execSync('tests/bootstrap.js', {stdio: 'inherit'});
} catch (ex) {
  process.exit(1);
}
