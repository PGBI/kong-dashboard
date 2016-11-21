#!/usr/bin/env node

var dashboard = require('../lib/kong-dashboard');
var parseArgs = require('minimist');
var argv = parseArgs(process.argv.slice(2));

if (argv.help || argv._.length !== 1 || (argv._[0] !== 'start' && argv._[0] !== 'build')) {
    console.log("Usage:");
    console.log(" * kong-dashboard build");
    console.log(" * kong-dashboard start [-p 8080]");
    process.exit()
}

if (argv._[0] === 'build') {
    dashboard.build();
}

if (argv._[0] === 'start') {
    var port = argv.p ? argv.p : 8080;
    var auth = argv.a;
    dashboard.serve(port, auth);
}
