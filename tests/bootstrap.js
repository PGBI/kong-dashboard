#!/usr/bin/env node

var execSync = require('child_process').execSync;
var request = require('request');

// Running tests
execSync('node_modules/.bin/jasmine JASMINE_CONFIG_PATH=./jasmine.json', {stdio: 'inherit'});
