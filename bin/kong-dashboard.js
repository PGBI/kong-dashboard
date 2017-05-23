#!/usr/bin/env node

var parseArgs = require('minimist');
var argv = parseArgs(process.argv.slice(2));
var child_process = require('child_process');

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

    // launch server
    console.log('Launching webserver');
    if (port) {
        process.env['kong-dashboard-port'] = port;
    }
    if (auth) {
        auth = auth.split('=');
        process.env['kong-dashboard-name'] = auth[0];
        process.env['kong-dashboard-pass'] = auth[1];
    }
    var server = child_process.fork(__dirname + '/server', [], {
        env: process.env
    });
    server.on('message', function (message) {
        process.stdout.write(message);
    });
    server.on('close', function (message) {
        process.stdout.write('Proxy server is down.');
    });
}
