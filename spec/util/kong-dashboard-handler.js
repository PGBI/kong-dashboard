var spawn = require('child_process').spawn;

var KongDashboardHandler = function() {

  this.stderr = '';

  this.stdout = '';

  this.childProcess = null;

  this.start = (options, cbOnStart, cbOnExit) => {
    var cmd = 'node bin/kong-dashboard start ';
    for (var key in options) {
      cmd += key + ' ' + options[key] + ' ';
    }
    this.childProcess = spawn(cmd, {shell: true});
    var port = options['-p'] || options['--port'] || 8080;
    this.childProcess.stdout.on('data', (data) => {
      this.stdout += data.toString();
      if (data.toString().trim() == 'Kong Dashboard has started on port ' + port) {
        cbOnStart();
      }
    });
    this.childProcess.stderr.on('data', (data) => {
      this.stderr += data;
    });
    this.childProcess.on('exit', (code) => {
      if (cbOnExit) {
        cbOnExit(code);
      }
    });
  };

  this.stop = () => {
    this.childProcess.stdout.pause();
    this.childProcess.stderr.pause();
    this.childProcess.kill();
  }
};

module.exports = KongDashboardHandler;
