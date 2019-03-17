#!/usr/bin/env node

var program = require('yargs');
var request = require('../lib/request');
var semver = require('semver');
var KongDashboardServer = require('../lib/server');
var terminal = require('../lib/terminal');

program
  .locale('en')
  .usage('$0 <cmd> [args]')

  .example('$0 start \\\n--kong-url http://kong:8001', 'Start Kong Dashboard on default port 8080')
  .example('','')
  .example('$0 start \\\n--kong-url http://kong:8001 \\\n--port 8888', 'Start Kong Dashboard on port 8888')
  .example('','')
  .example('$0 start \\\n--kong-url http://kong:8001 \\\n--basic-auth u1=p1 u2=p2', 'Start Kong Dashboard on port 8080. Protect it with basic auth. Define two users, "u1" with password "p1" and "u2" with password "p2"')

  .command('start', 'Start serving Kong Dashboard', function (cmd) {
    return cmd
      .option('kong-url', {
        alias: 'u',
        required: true,
        describe: 'Url of Kong admin API\n',
        type: 'string'
      })
      .option('p', {
        alias: 'port',
        default: 8080,
        describe: 'Port on which Kong Dashboard will be served\n',
        type: 'number'
      })
      .option('basic-auth', {
        describe: 'Of the form "user1=password1 user2=password2 ...". If set, Kong Dashboard will be protected with basic auth.\n',
        type: 'array'
      })
      .option('api-key', {
        type: 'string',
        describe: 'API Key to use to connect to Kong admin API if it is protected with key auth\n'
      })
      .option('api-key-name', {
        type: 'string',
        default: 'apikey',
        describe: 'Authentication API Key header name\n'
      })
      .option('g', {
        alias: 'gelato',
        type: 'boolean',
        describe: 'If set, each Kong consumer will be linked with their associated account on Gelato\n'
      })
      .option('kong-username', {
        type: 'string',
        describe: 'Username to use to connect to Kong admin API if it is protected with basic auth\n'
      })
      .option('kong-password', {
        type: 'string',
        describe: 'Password to use to connect to Kong admin API if it is protected with basic auth\n'
      })
      .option('insecure', {
        type: 'boolean',
        describe: "Authenticated connections to Kong over an insecured protocol won't be accepted unless this option is used\n"
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

  argv.kongUrl = argv.kongUrl instanceof Array ? argv.kongUrl[0] : argv.kongUrl;
  argv.port = argv.port instanceof Array ? argv.port[0] : argv.port;
  argv.basicAuth = argv.basicAuth || [];

  var basicAuth = {};
  argv.basicAuth.forEach((element) => {
    var creds = element.split('=');
    if (creds.length != 2) {
      terminal.warning('Invalid value "' + element + '" for --basic-auth option. Ignoring.');
    } else {
      basicAuth[creds[0]] = creds[1];
    }
  });
  argv.basicAuth = basicAuth;

  argv.kongRequestOpts = {'headers': {}};
  if ((argv.kongUsername && argv.kongPassword) || argv.apiKey) {
    if (!argv.kongUrl.startsWith('https://') && !argv.insecure) {
      terminal.error("You should not connect to Kong admin API using credentials over an unsecured protocol (http).\nUse the --insecure option to ignore this error.");
      process.exit(1);
    }
  }

  if (argv.kongUsername && argv.kongPassword) {
    var base64 = new Buffer(argv.kongUsername + ':' + argv.kongPassword).toString('base64');
    argv.kongRequestOpts.headers['Authorization'] = 'Basic ' + base64;
  }

  if (argv.apiKey !== '' && typeof argv.apiKey !== 'undefined') {
    argv.kongRequestOpts.headers[argv.apiKeyName.toLowerCase()] = argv.apiKey;
  }

  terminal.info("Connecting to Kong on " + argv.kongUrl + " ...");

  request.get(argv.kongUrl, argv.kongRequestOpts).then((response) => {
    if (response.statusCode == 401) {
      terminal.error("Can't connect to Kong: authentication required");
      process.exit(1);
    }

    if (response.statusCode == 403) {
      terminal.error("Can't connect to Kong: invalid authentication credentials");
      process.exit(1);
    }

    try {
      var body = JSON.parse(response.body);
    } catch (e) {}

    if (!body || !body.tagline || body.tagline != 'Welcome to kong') {
      terminal.error("What's on " + argv.kongUrl + " isn't Kong");
      process.exit(1);
    } else {
      return body.version;
    }
  }, (error) => {
    terminal.error('Could not reach Kong on ' + argv.kongUrl);
    terminal.error('Error details:');
    terminal.error(error);
    process.exit(1);
  }).then((version) => {
    if (semver.lt(version, '0.9.0')) {
      terminal.error("This version of Kong dashboard doesn't support Kong v0.9 and lower.");
      process.exit(1);
    }
    if (semver.gte(version, '2.0.0')) {
      terminal.error("This version of Kong dashboard doesn't support Kong v2.0 and higher.");
      process.exit(1);
    }
    terminal.success("Connected to Kong on " + argv.kongUrl + ".");
    terminal.info("Kong version is " + version);
    argv.kongVersion = version;
    var angularConfig = {
      kong_url: argv.kongUrl,
      kong_version: argv.kongVersion,
      kong_dashboard_version: require('../package.json').version,
      gelato_integration: argv.gelato
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
