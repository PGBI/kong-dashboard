var request = require('request');
var KongDashboard = require('./util/kong-dashboard-handler');

console.log(process.env.KONG_VERSION);

describe('Starting Kong-dashboard', function () {

  it("should error if required kong_url parameter is missing", function (done) {
    var kd = new KongDashboard();
    kd.start({}, () => {}, (code) => {
      expect(code).toBe(1);
      expect(kd.stderr).toContain('Missing required argument: kong_url');
      done()
    });
  });

  it("should error if kong isn't reachable", function (done) {
    var kd = new KongDashboard();
    kd.start({'--kong_url': 'http://localhost:8002'}, () => {}, (code) => {
      expect(code).toBe(1);
      expect(kd.stderr).toContain('Could not reach Kong on http://localhost:8002');
      done();
    });
  });

  it("should error if kong_url doesn't not point to a Kong admin API", function (done) {
    var kd = new KongDashboard();
    kd.start({'--kong_url': 'http://www.google.com'}, () => {}, (code) => {
      expect(code).toBe(1);
      expect(kd.stderr).toContain("What\'s on http://www.google.com isn\'t Kong");
      done();
    });
  });

  it("should successfully start", function(done) {
    var kd = new KongDashboard();
    kd.start({'--kong_url': 'http://localhost:8001'}, () => {
      expect(kd.stdout).toContain("Kong Dashboard has started on port 8080");
      kd.stop();
      done();
    });
  });

  it("should successfully start on a custom port", function(done) {
    var kd = new KongDashboard();
    kd.start({'--kong_url': 'http://localhost:8001', '-p': '8082'}, () => {
      expect(kd.stdout).toContain("Kong Dashboard has started on port 8082");
      kd.stop();
      done();
    });
  });

  it("should successfully start with basic auth", function(done) {
    var kd = new KongDashboard();
    kd.start({'--kong_url': 'http://localhost:8001', '--auth_basic': 'user user2=password2'}, kongStarted);

    function kongStarted() {
      expect(kd.stdout).toContain('Invalid value "user" for --auth_basic option. Ignoring.');
      expect(kd.stdout).toContain("Kong Dashboard has started on port 8080");

      var authOptions = {auth: {user: 'user2', pass: 'password2', sendImmediately: false}};
      var hitProxyWithoutAuth = new Promise((resolve, reject) => {
        request('http://localhost:8080/proxy', (error, response, body) => {
          expect(response.statusCode).toBe(401);
          resolve();
        });
      });
      var hitProxyWithAuth = new Promise((resolve, reject) => {
        request('http://localhost:8080/proxy', authOptions, (error, response, body) => {
          expect(response.statusCode).toBe(200);
          resolve();
        });
      });
      var hitWebAppWithoutAuth = new Promise((resolve, reject) => {
        request('http://localhost:8080', (error, response, body) => {
          expect(response.statusCode).toBe(401);
          resolve();
        });
      });
      var hitWebAppWithAuth = new Promise((resolve, reject) => {
        request('http://localhost:8080', authOptions, (error, response, body) => {
          expect(response.statusCode).toBe(200);
          resolve();
        });
      });
      Promise.all([hitProxyWithoutAuth, hitProxyWithAuth, hitWebAppWithoutAuth, hitWebAppWithAuth]).then(() => {
        kd.stop();
        done();
      });
    }
  });
});
