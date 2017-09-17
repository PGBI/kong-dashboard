#!/usr/bin/env node

var program = require('yargs');
var request = require('request');
var compareVersions = require('compare-versions');
var child_process = require('child_process');
var KongDashboardServer = require('../lib/server');

program
  .usage('$0 <cmd> [args]')

  .example('$0 start \\\n--kong_url http://kong:8001', 'Start Kong Dashboard on default port 8080')
  .example('','')
  .example('$0 start \\\n--kong_url http://kong:8001 \\\n--port 8888', 'Start Kong Dashboard on port 8888')
  .example('','')
  .example('$0 start \\\n--kong_url http://kong:8001 \\\n--auth_basic u1=p1 u2=p2', 'Start Kong Dashboard on port 8080. Protect it with basic auth. Define two users, "u1" with password "p1" and "u2" with password "p2"')

  .command('start', 'Start serving Kong Dashboard', function (cmd) {
    return cmd
      .option('u', {
        alias: 'kong_url',
        required: true,
        describe: 'Url of the admin API of Kong',
        type: 'string'
      })
      .option('p', {
        alias: 'port',
        default: 8080,
        describe: 'Port on which Kong Dashboard will be served',
        type: 'number'
      })
      .option('a', {
        alias: 'auth_basic',
        describe: 'Of the form "user1=password1 user2=password2 ...". If set, Kong Dashboard will be protected with basic auth.',
        type: 'array'
      })
      .option('g', {
        alias: 'gelato_integration',
        boolean: true,
        describe: 'If set, each Kong consumer will be linked with their associated account on Gelato'
      })
      .strict(true);
  }, start)
  .showHelpOnFail(true, 'Specify --help for available options')
  .strict(true)
  .help('help')
  .version(function() {
    return require('../package.json').version;
  });

if (program.argv._.length == 0) {
  abortAndShowHelp();
}

function start(argv) {
  for (var property in argv) {
    var reject = false;
    if (Number.isNaN(argv[property])) {
      reject = true;
      console.error("Invalid option " + property);
    }
    if (reject) {
      abortAndShowHelp();
    }
  }

  argv.kong_url = argv.kong_url instanceof Array ? argv.kong_url[0] : argv.kong_url;
  argv.port = argv.port instanceof Array ? argv.port[0] : argv.port;
  argv.auth_basic = typeof argv.auth_basic == 'undefined' ? [] : argv.auth_basic;

  var auth_basic = {};
  argv.auth_basic.forEach((element) => {
    var creds = element.split('=');
    if (creds.length != 2) {
      console.log('Invalid value "' + element + '" for --auth_basic option. Ignoring.');
    } else {
      auth_basic[creds[0]] = creds[1];
    }
  });
  argv.auth_basic = auth_basic;

  console.warn("Connecting to Kong on " + argv.kong_url + " ...");

  request({
    method: 'GET',
    uri: argv.kong_url
  }, function(error, response, body) {
    if (error) {
      console.log('Could not reach Kong on ' + argv.kong_url);
      console.log('Error details:');
      console.log(error);
      process.exit(1);
    }

    try {
      body = JSON.parse(body);
      if (body.tagline != 'Welcome to kong') {
        throw 'not kong';
      }
      var version = body.version;
    } catch(e) {
      console.log(e);
      console.log("What's on " + argv.kong_url + " isn't Kong");
      process.exit(1);
    }
    if (compareVersions('0.9.0', version) > 0) {
      console.log("This version of Kong dashboard doesn't support Kong v0.9 and lower.");
      process.exit(1);
    }
    if (compareVersions(version, '0.11.0') >= 0) {
      console.log("This version of Kong dashboard doesn't support Kong v0.11 and higher.");
      process.exit(1);
    }
    console.log("Connected to Kong on " + argv.kong_url + ".");
    console.log("Kong version is " + version);
    argv.kong_version = version;
    startKongDashboard(argv);
  })
}

function abortAndShowHelp() {
  program.showHelp();
  process.exit(1);
}

function startKongDashboard(args) {
  var server = new KongDashboardServer();
  server.start(args.port, args.kong_url, args.auth_basic);
}
