var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var fs = require ('fs');

console.log(process.env.KONG_VERSION);

describe('Starting Kong-dashboard', function () {
  it("should error if required kong_url parameter is missing", function (done) {
    exec('node ./bin/kong-dashboard.js start', (err, stdout, stderr) => {
      assert.include(stderr, 'Missing required argument: kong_url', 'string contains substring');
      done();
    });
  });
  it("should error if kong isn't reachable", function (done) {
    exec('node ./bin/kong-dashboard.js start --kong_url http://localhost:8002', (err, stdout, stderr) => {
      assert.include(stdout, 'Could not reach Kong on http://localhost:8002', 'string contains substring');
      done();
    });
  });
  it("should error if kong_url doesn't not point to a Kong admin API", function (done) {
    exec('node ./bin/kong-dashboard.js start --kong_url http://www.google.com', (err, stdout, stderr) => {
      assert.include(stdout, "What\'s on http://www.google.com isn\'t Kong", 'string contains substring');
      done();
    });
  });
  it("should successfully start", function(done) {
    var child = spawn('node bin/kong-dashboard start --kong_url http://localhost:8001', {shell: true});
    child.stdout.on('data', (data) => {
      if (data.toString().trim() == 'Kong Dashboard has started on port 8080') {
        done();
      }
    });
  });
  it("should successfully start on a custom port", function(done) {
    var child = spawn('node bin/kong-dashboard start --kong_url http://localhost:8001 -p 8081', {shell: true});
    child.stdout.on('data', (data) => {
      if (data.toString().trim() == 'Kong Dashboard has started on port 8081') {
        done();
      }
    });
  })
});
