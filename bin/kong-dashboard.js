#!/usr/bin/env node

var program = require('yargs');
var request = require('../lib/request');
var semver = require('semver');
var KongDashboardServer = require('../lib/server');
var terminal = require('../lib/terminal');

program
  .usage('$0 <cmd> [args]')

  .example('$0 start \\\n--kong_url http://kong:8001', 'Start Kong Dashboard on default port 8080')
  .example('','')
  .example('$0 start \\\n--kong_url http://kong:8001 \\\n--port 8888', 'Start Kong Dashboard on port 8888')
  .example('','')
  .example('$0 start \\\n--kong_url http://kong:8001 \\\n--auth_basic u1=p1 u2=p2', 'Start Kong Dashboard on port 8080. Protect it with basic auth. Define two users, "u1" with password "p1" and "u2" with password "p2"')

  .command('start', 'Start serving Kong Dashboard', function (cmd) {
    return cmd
      .option('kong_url', {
        alias: 'u',
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
  }, (argv) => {
    handle(argv, start);
  })
  .option('v', {
    alias: 'verbose',
    boolean: true,
    describe: 'Increase kong-dashboard command line verbosity'
  })
  .showHelpOnFail(true, 'Specify --help for available options')
  .strict(true)
  .help('help')
  .version(function() {
    return require('../package.json').version;
  });

if (program.argv._.length == 0) {
  abortAndShowHelp();
}

function handle(argv, cmd) {
  terminal.setVerbose(argv.verbose);
  cmd(argv);
}

function start(argv) {
  for (var property in argv) {
    var reject = false;
    if (Number.isNaN(argv[property])) {
      reject = true;
      terminal.error("Invalid option " + property);
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
      terminal.warning('Invalid value "' + element + '" for --auth_basic option. Ignoring.');
    } else {
      auth_basic[creds[0]] = creds[1];
    }
  });
  argv.auth_basic = auth_basic;

  terminal.info("Connecting to Kong on " + argv.kong_url + " ...");

  request.get(argv.kong_url).then((response) => {
    if (response.statusCode == 401) {
      terminal.error("Can't connect to Kong: authentication required");
      process.exit(1);
    }

    try {
      var body = JSON.parse(response.body);
    } catch (e) {}

    if (!body || !body.tagline || body.tagline != 'Welcome to kong') {
      terminal.error("What's on " + argv.kong_url + " isn't Kong");
      process.exit(1);
    } else {
      return body.version;
    }
  }, (error) => {
    terminal.error('Could not reach Kong on ' + argv.kong_url);
    terminal.error('Error details:');
    terminal.error(error);
    process.exit(1);
  }).then((version) => {
    if (semver.lt(version, '0.9.0')) {
      terminal.error("This version of Kong dashboard doesn't support Kong v0.9 and lower.");
      process.exit(1);
    }
    if (semver.gte(version, '0.12.0')) {
      terminal.error("This version of Kong dashboard doesn't support Kong v0.11 and higher.");
      process.exit(1);
    }
    terminal.success("Connected to Kong on " + argv.kong_url + ".");
    terminal.info("Kong version is " + version);
    argv.kong_version = version;
    var angularConfig = {
      kong_url: argv.kong_url,
      kong_version: argv.kong_version,
      gelato_integration: argv.gelato_integration
    };
    startKongDashboard(argv, angularConfig);
  });
}

function abortAndShowHelp() {
  program.showHelp();
  process.exit(1);
}

function startKongDashboard(backendConfig, angularConfig) {
  var server = new KongDashboardServer();
  server.start(backendConfig, angularConfig);
}
