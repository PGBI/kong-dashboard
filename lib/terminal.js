var chalk = require('chalk');

var verbose = false;

var Terminal = {
  verbose: false,
  debug: (message) => {
    if (verbose) {
      if (typeof message == 'string') {
        console.log(chalk.white(message));
      } else {
        console.log(message);
      }
    }
  },
  success: (message) => {
    if (typeof message == 'string') {
      console.log(chalk.green(message));
    } else {
      console.log(message);
    }
  },
  info: (message) => {
    console.log(message);
  },
  warning: (message) => {
    if (typeof message == 'string') {
      console.log(chalk.yellow(message));
    } else {
      console.log(message);
    }
  },
  error: (message) => {
    if (typeof message == 'string') {
      console.error(chalk.red(message));
    } else {
      console.error(message);
    }
  },
  setVerbose: (v) => {
    verbose = v;
  }
};

module.exports = Terminal;
