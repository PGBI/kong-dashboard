var request = require('../../lib/request');
var KongDashboard = require('../util/KongDashboard');
var Kong = require('../util/KongClient');
var semver = require('semver');

var kd = new KongDashboard();

describe('Starting Kong-dashboard', function () {

  beforeAll((done) => {
    Promise.all([
      Kong.deleteAllAPIs(),
      Kong.deleteAllServices(),
      Kong.deleteAllPlugins()
    ]).then(() => {
      return Promise.all([
        createBasicAuthProtectedKongAPI(),
        createKeyAuthProtectedKongAPI(),
        createBasicAuthProtectedKongServiceAndRoute(),
        createKeyAuthProtectedKongServiceAndRoute(),
        createConsumer()
      ]);
    }).then(done);
  });

  afterEach((done) => {
    kd.stop(() => {
      kd.clean();
      done();
    });
  });

  it("should error if required kong_url parameter is missing", (done) => {
    kd.start({}, () => {}, (code) => {
      expect(code).toBe(1);
      expect(kd.stderr).toContain('Missing required argument: kong-url');
      done();
    });
  });

  it("should error if kong isn't reachable", (done) => {
    kd.start({'--kong-url': 'http://127.0.0.1:8002'}, () => {}, (code) => {
      expect(code).toBe(1);
      expect(kd.stderr).toContain('Could not reach Kong on http://127.0.0.1:8002');
      done();
    });
  });

  it("should error if kong-url doesn't not point to a Kong admin API", (done) => {
    kd.start({'--kong-url': 'http://www.google.com'}, () => {}, (code) => {
      expect(code).toBe(1);
      expect(kd.stderr).toContain("What\'s on http://www.google.com isn\'t Kong");
      done();
    });
  });

  it("should successfully start on a custom port", (done) => {
    kd.start({'--kong-url': 'http://127.0.0.1:8001', '-p': '8082'}, () => {
      expect(kd.stdout).toContain("Kong Dashboard has started on port 8082");
      done();
    });
  });

  it("should successfully start with basic auth", (done) => {
    kd.start({
      '--kong-url': 'http://127.0.0.1:8001',
      '--basic-auth': 'user user2=password2'
    }, kongStarted);

    function kongStarted() {
      expect(kd.stdout).toContain('Invalid value "user" for --basic-auth option. Ignoring.');
      expect(kd.stdout).toContain("Kong Dashboard has started on port 8081");

      var opts = {auth: {user: 'user2', pass: 'password2', sendImmediately: true}};

      request.get('http://localhost:8081/proxy', opts)
        .then((response) => {
          expect(response.statusCode).toBe(200);
          return request.get('http://localhost:8081', opts);
        })
        .then((response) => {
          expect(response.statusCode).toBe(200);
          return request.get('http://localhost:8081/proxy');
        })
        .then((response) => {
          expect(response.statusCode).toBe(401);
          return request.get('http://localhost:8081');
        })
        .then((response) => {
          expect(response.statusCode).toBe(401);
          done();
        });
    }
  });

  describe('When Kong is protected with the basic-auth-credential plugin', function () {

    it("should successfully start when valid basic-auth-credential creds are provided", (done) => {
      kd.start({
        '-u': 'http://localhost:8000/kong_with_basic_auth',
        '--kong-username': 'test-user',
        '--kong-password': 'password',
        '--insecure': ''
      }, () => {
        expect(kd.stdout).toContain("Kong Dashboard has started on port 8081");
        request.get('http://localhost:8081/proxy').then((response) => {
          expect(response.statusCode).toBe(200);
          done();
        });
      }, (code) => {
        // failing test on error instead of keeping it stuck till timeout ends
        expect(kd.stderr).toBe("");
        expect(code).toBeFalsy();
        done();
      });
    });

    it("should error if basic auth credentials aren't set", (done) => {
      kd.start({'--kong-url': 'http://localhost:8000/kong_with_basic_auth'}, () => {}, (code) => {
        expect(code).toBe(1);
        expect(kd.stderr).toContain("Can\'t connect to Kong: authentication required");
        done();
      });
    });

    it("should error if basic auth credentials aren't correct", (done) => {
      kd.start({
        '-u': 'http://localhost:8000/kong_with_basic_auth',
        '--kong-username': 'test-user',
        '--kong-password': 'wrong',
        '--insecure': ''
      }, () => {
      }, (code) => {
        expect(code).toBe(1);
        expect(kd.stderr).toContain("Can't connect to Kong: invalid authentication credentials");
        done();
      });
    });

    it("should error if Kong is protected with basic auth using http", (done) => {
      kd.start({
        '-u': 'http://localhost:8000/kong_with_basic_auth',
        '--kong-username': 'test-user',
        '--kong-password': 'whatever'
      }, () => {
      }, (code) => {
        expect(code).toBe(1);
        expect(kd.stderr).toContain("You should not connect to Kong admin API using credentials over an unsecured protocol (http)");
        done();
      });
    });
  });

  describe('When Kong is protected with the auth-key plugin', function () {

    it("should error if no keys are provided", (done) => {
      kd.start({
        '-u': 'http://localhost:8000/kong_with_key_auth',
      }, () => {}, (code) => {
        expect(code).toBe(1);
        expect(kd.stderr).toContain("Can't connect to Kong: authentication required");
        done();
      });
    });

    it("should error if the provided key is invalid", (done) => {
      kd.start({
        '-u': 'http://localhost:8000/kong_with_key_auth',
        '--api-key': '123',
        '--insecure': '',
      }, () => {}, (code) => {
        expect(code).toBe(1);
        expect(kd.stderr).toContain("Can't connect to Kong: invalid authentication credentials");
        done();
      });
    });

    it("should successfully start if the provided key is valid", (done) => {
      kd.start({
        '-u': 'http://localhost:8000/kong_with_key_auth',
        '--api-key': 'abcdefghi',
        '--insecure': '',
      }, () => {
        expect(kd.stdout).toContain("Kong Dashboard has started on port 8081");
        request.get('http://localhost:8081/proxy').then((response) => {
          expect(response.statusCode).toBe(200);
          done();
        });
      }, (code) => {
        // failing test on error instead of keeping it stuck till timeout ends
        expect(kd.stderr).toBe("");
        expect(code).toBeFalsy();
        done();
      });
    });
  });
});

function createBasicAuthProtectedKongAPI() {
  var apiPromise;

  if (semver.satisfies(process.env.KONG_VERSION, '0.9.x')) {
    apiPromise = Kong.createAPI({
      name: 'KongWithBasicAuth',
      upstream_url: 'http://localhost:8001',
      request_path: '/kong_with_basic_auth',
      strip_request_path: true
    });
  }
  else if (semver.satisfies(process.env.KONG_VERSION, '>=0.10.0 < 0.15.0')) {
    apiPromise = Kong.createAPI({
      name: 'KongWithBasicAuth',
      upstream_url: 'http://localhost:8001',
      uris: ['/kong_with_basic_auth'],
      strip_uri: true
    });
  }
  else if (semver.gte(process.env.KONG_VERSION, '0.15.0')) {
    return Promise.resolve(0); // use the service/route based tests instead
  }

  else {
    throw new Error('Kong version not supported in unit tests: ' + process.env.KONG_VERSION)
  }

  return apiPromise.then((api) => {
    return Kong.createPlugin({
      api_id: api.id,
      name: 'basic-auth'
    });
  })
}

function createBasicAuthProtectedKongServiceAndRoute() {
  if (semver.lt(process.env.KONG_VERSION, '0.15.0')) {
    return Promise.resolve(0); // use legacy API-based tests
  }

  var service;
  var route;

  var servicePromise =  Kong.createService({
    name: 'KongWithBasicAuth',
    protocol: `http`,
    host: `localhost`,
    port: 8001
  });

  var routePromise =  servicePromise.then((svc) => {
    service = svc;

    return Kong.createRoute({
      service: { id: svc.id },
      name: 'KongWithBasicAuth',
      protocols: ['http', 'https'],
      paths: ['/kong_with_basic_auth'],
      strip_path: true
    })
  });

  return routePromise.then((rt) => {
    route = rt;

    return Kong.createPlugin({
      name: 'basic-auth',
      run_on: `first`,
      route: {id: route.id},
      service: {id: service.id}
    });      
  })
}

function createKeyAuthProtectedKongAPI() {
  let promise;

  if (semver.satisfies(process.env.KONG_VERSION, '0.9.x')) {
    promise = Kong.createAPI({
      name: 'KongWithKey',
      upstream_url: 'http://localhost:8001',
      request_path: '/kong_with_key_auth',
      strip_request_path: true
    });
  }
  else if (semver.satisfies(process.env.KONG_VERSION, '>=0.10.0 < 0.15.0')) {
    promise = Kong.createAPI({
      name: 'KongWithKey',
      upstream_url: 'http://localhost:8001',
      uris: ['/kong_with_key_auth'],
      strip_uri: true
    });
  }
  else if (semver.gte(process.env.KONG_VERSION, '0.15.0')) {
    return Promise.resolve(0); // use the service/route based tests instead
  }

  else {
    throw new Error('Kong version not supported in unit tests: ' + process.env.KONG_VERSION)
  }

  return promise.then((api) => {
    return Kong.createPlugin({
      api_id: api.id,
      name: 'key-auth',
      config: {
        key_names: ['apikey']
      }
    });
  })
}

function createKeyAuthProtectedKongServiceAndRoute() {
  if (semver.lt(process.env.KONG_VERSION, '0.15.0')) {
    return Promise.resolve(0); // use legacy API-based tests
  }

  var service;
  var route;

  var servicePromise =  Kong.createService({
    name: 'KongWithKey',
    protocol: `http`,
    host: `localhost`,
    port: 8001
  });

  var routePromise =  servicePromise.then((svc) => {
    service = svc;
    
    return Kong.createRoute({
      service: { id: svc.id },
      name: 'KongWithKey',
      protocols: ['http', 'https'],
      paths: ['/kong_with_key_auth'],
      strip_path: true
    })
  });

  return routePromise.then((rt) => {
    route = rt;

    return Kong.createPlugin({
      name: 'key-auth',
      run_on: `first`,
      route: {id: route.id},
      service: {id: service.id},
      config: {key_names: ['apikey']}
    });      
  })  
}

function createConsumer() {
  return Kong.createConsumer({
    custom_id: Date.now().toString()
  }).then((consumer) => {
    return Promise.all([
      Kong.createBasicAuthCreds(consumer, 'test-user', 'password'),
      Kong.createKeyAuthCreds(consumer, 'abcdefghi')
    ]);
  });
}
