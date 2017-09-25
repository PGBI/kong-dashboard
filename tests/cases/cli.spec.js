var request = require('../../lib/request');
var KongDashboard = require('../util/kong-dashboard-handler');

console.log(process.env.KONG_VERSION);

describe('Starting Kong-dashboard', function () {

  it("should error if required kong_url parameter is missing", (done) => {
    var kd = new KongDashboard();
    kd.start({}, () => {}, (code) => {
      expect(code).toBe(1);
      expect(kd.stderr).toContain('Missing required argument: kong_url');
      done()
    });
  });

  it("should error if kong isn't reachable", (done) => {
    var kd = new KongDashboard();
    kd.start({'--kong_url': 'http://127.0.0.1:8002'}, () => {}, (code) => {
      expect(code).toBe(1);
      expect(kd.stderr).toContain('Could not reach Kong on http://127.0.0.1:8002');
      done();
    });
  });

  it("should error if kong_url doesn't not point to a Kong admin API", (done) => {
    var kd = new KongDashboard();
    kd.start({'--kong_url': 'http://www.google.com'}, () => {}, (code) => {
      expect(code).toBe(1);
      expect(kd.stderr).toContain("What\'s on http://www.google.com isn\'t Kong");
      done();
    });
  });

  it("should successfully start", (done) => {
    var kd = new KongDashboard();
    kd.start({'--kong_url': 'http://127.0.0.1:8001'}, () => {
      expect(kd.stdout).toContain("Kong Dashboard has started on port 8080");
      kd.stop();
      done();
    });
  });

  it("should successfully start on a custom port", (done) => {
    var kd = new KongDashboard();
    kd.start({'--kong_url': 'http://127.0.0.1:8001', '-p': '8082'}, () => {
      expect(kd.stdout).toContain("Kong Dashboard has started on port 8082");
      kd.stop();
      done();
    });
  });

  it("should successfully start with basic auth", (done) => {
    var kd = new KongDashboard();
    kd.start({'--kong_url': 'http://127.0.0.1:8001', '--auth_basic': 'user user2=password2'}, kongStarted);

    function kongStarted() {
      expect(kd.stdout).toContain('Invalid value "user" for --auth_basic option. Ignoring.');
      expect(kd.stdout).toContain("Kong Dashboard has started on port 8080");

      var opts = {auth: {user: 'user2', pass: 'password2', sendImmediately: true}};

      request.get('http://localhost:8080/proxy', opts)
        .then((response) => {
          expect(response.statusCode).toBe(200);
          return request.get('http://localhost:8080', opts);
        })
        .then((response) => {
          expect(response.statusCode).toBe(200);
          return request.get('http://localhost:8080/proxy');
        })
        .then((response) => {
          expect(response.statusCode).toBe(401);
          return request.get('http://localhost:8080');
        })
        .then((response) => {
          expect(response.statusCode).toBe(401);
          kd.stop(done);
        });
    }
  });
});
