#!/usr/bin/env node

var dashboard = require('../lib/kong-dashboard');
var parseArgs = require('minimist');
var argv = parseArgs(process.argv.slice(2));

// validate options
var validOptions = ['_', 'a', 'p'];
function hasInvalidOptions (argv) {
    var isInvalid = false;
    Object.keys(argv).some(function (optionName) {
        if (validOptions.indexOf(optionName) < 0) {
            isInvalid = true;
            return true;
        }
    });
    return isInvalid;
}

// show help
var validCommands = ['start', 'build']
if (argv.help || hasInvalidOptions(argv) || validCommands.indexOf(argv._[0]) < 0) {
    console.log("Usage:");
    console.log(" * kong-dashboard build");
    console.log(" * kong-dashboard start [-p 8080] [-a user=password]");
    process.exit();
}

// build assets
if (argv._[0] === 'build') {
    dashboard.build();
}

// start server
if (argv._[0] === 'start') {
    var port = argv.p ? argv.p : 8080;
    var auth = argv.a;
    dashboard.serve(port, auth);
}
