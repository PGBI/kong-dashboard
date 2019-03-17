var HomePage = require('../../util/HomePage');
var Sidebar = require('../../util/Sidebar');
var PluginPage = require('../../util/PluginPage');
var ListPluginsPage = require('../../util/ListPluginsPage');
var KongDashboard = require('../../util/KongDashboard');
var Kong = require('../../util/KongClient');
var PropertyInput = require('../../util/PropertyInput');
var ObjectProperties = require('../../util/ObjectProperties');
var semver = require('semver');

var kd = new KongDashboard();

describe('Basic Auth plugin testing:', () => {

  var api;
  var anonymousConsumer;

  beforeAll((done) => {
    kd.start({'--kong-url': 'http://127.0.0.1:8001'}, () => {
      Promise.all([
        Kong.deleteAllAPIs(),
        Kong.deleteAllConsumers(),
        Kong.deleteAllPlugins()
      ]).then(() => {
        return createAPI();
      }).then((response) => {
        api = response;
        return Kong.createConsumer({'username': 'anonymous_consumer'});
      }).then((response) => {
        anonymousConsumer = response;
        done();
      });
    });
  });

  afterAll((done) => {
    kd.stop(done);
  });

  beforeEach((done) => {
    Kong.deleteAllPlugins().then(done);
  });

  it('should successfully create basic auth plugin for All APIs or Services', (done) => {
    HomePage.visit();
    Sidebar.clickOn('Plugins');
    ListPluginsPage.clickAddButton();

    var inputs;
    var expectedPluginParams;

    if (semver.satisfies(process.env.KONG_VERSION, '0.9.x')) {
      inputs = {
        'name': 'basic-auth',
        'api_id': 'All',
        'config-hide_credentials': true
      };
      expectedPluginParams = {
        'name': 'basic-auth',
        'config': {'hide_credentials': true},
        'enabled': true
      };
    } else if (semver.satisfies(process.env.KONG_VERSION, '>=0.10.0 < 0.15.0')) {
      inputs = {
        'name': 'basic-auth',
        'api_id': 'All',
        'config-hide_credentials': true,
        'config-anonymous': anonymousConsumer.id
      };
      expectedPluginParams = {
        'name': 'basic-auth',
        'config': {'hide_credentials': true, 'anonymous': anonymousConsumer.id},
        'enabled': true
      };
    } else if (semver.satisfies(process.env.KONG_VERSION, '>=0.15.0 < 2.0.0')) {
      inputs = {
        'name': 'basic-auth',        
        'run_on' : 'first',
        'config-hide_credentials': true,
        'config-anonymous': anonymousConsumer.id
      };
      expectedPluginParams = {
        'name': 'basic-auth',
        'run_on': 'first',
        'config': {'hide_credentials': true, 'anonymous': anonymousConsumer.id},
        'enabled': true,
        'service': null,
        'consumer': null,
        'route': null
      };

      if (semver.satisfies(process.env.KONG_VERSION, '>=0.15.0 < 1.0.0')) {
        expectedPluginParams['api'] = null;
      }
    } else {
      throw new Error('Kong version not supported in unit tests.')
    }

    ObjectProperties.fillAndSubmit(inputs).then(() => {
      expect(element(by.cssContainingText('div.toast', 'Plugin saved!')).isPresent()).toBeTruthy();
      return Kong.getFirstPlugin();
    }).then((createdPlugin) => {
      delete createdPlugin['id'];
      delete createdPlugin['created_at'];
      expect(createdPlugin).toEqual(expectedPluginParams);
      done();
    });
  });

  it('should successfully create a basic-auth plugin for one API', (done) => {
    if (semver.gte(process.env.KONG_VERSION, '0.15.0')) {
      return done(); // legacy since 0.15.0
    }

    HomePage.visit();
    Sidebar.clickOn('Plugins');
    ListPluginsPage.clickAddButton();

    if (semver.satisfies(process.env.KONG_VERSION, '0.9.x')) {
      inputs = {
        'api_id': api.name,
        'name': 'basic-auth',
        'config-hide_credentials': true
      };
      expectedPluginParams = {
        'api_id': api.id,
        'name': 'basic-auth',
        'config': {'hide_credentials': true},
        'enabled': true
      };
    } else if (semver.satisfies(process.env.KONG_VERSION, '>=0.10.0 < 0.15.0')) {
      inputs = {
        'name': 'basic-auth',
        'api_id': api.name,
        'config-hide_credentials': true,
        'config-anonymous': anonymousConsumer.id
      };
      expectedPluginParams = {
        'api_id': api.id,
        'name': 'basic-auth',
        'config': {'hide_credentials': true, 'anonymous': anonymousConsumer.id},
        'enabled': true
      };
    } else {
      throw new Error('Kong version not supported in unit tests.')
    }

    ObjectProperties.fillAndSubmit(inputs).then(() => {
      expect(element(by.cssContainingText('div.toast', 'Plugin saved!')).isPresent()).toBeTruthy();
      return Kong.getFirstPlugin();
    }).then((createdPlugin) => {
      delete createdPlugin['id'];
      delete createdPlugin['created_at'];
      expect(createdPlugin).toEqual(expectedPluginParams);
      done();
    });
  });

  it('should be possible to edit a previously created basic-auth plugin', (done) => {
    Kong.createPlugin({
      name: 'basic-auth',
      config: {hide_credentials: false}
    }).then((createdPlugin) => {
      PluginPage.visit(createdPlugin.id);
      var inputs = {
        'config-hide_credentials': true
      };
      return ObjectProperties.fillAndSubmit(inputs);
    }).then(() => {
      expect(element(by.cssContainingText('div.toast', 'Plugin saved!')).isPresent()).toBeTruthy();
      return Kong.getFirstPlugin();
    }).then((updatedPlugin) => {
      if (semver.satisfies(process.env.KONG_VERSION, '0.9.x')) {
        expect(updatedPlugin.config).toEqual({'hide_credentials': true});
      } else if (semver.satisfies(process.env.KONG_VERSION, '>=0.10.0 < 0.15.0')) {
        expect(updatedPlugin.config).toEqual({'hide_credentials': true, 'anonymous': ''});
      } else if (semver.gte(process.env.KONG_VERSION, '0.15.0')) {
        expect(updatedPlugin.config).toEqual({'hide_credentials': true, 'anonymous': null});
      } else {
        throw new Error('Kong version not supported in unit tests.')
      }
      done();
    });
  });

  it('should error when attempting to create a basic-auth plugin if an other one already exists', (done) => {
    HomePage.visit();
    Sidebar.clickOn('Plugins');
    ListPluginsPage.clickAddButton();

    var inputs;
    if (semver.satisfies(process.env.KONG_VERSION, '>=0.9.0 < 0.15.0')) {
      inputs = {
        'name': 'basic-auth',
        'api_id': 'All',
        'config-hide_credentials': true
      };
    } else if (semver.satisfies(process.env.KONG_VERSION, '>=0.15.0 < 2.0.0')) {
      inputs = {
        'name': 'basic-auth',        
        'run_on' : 'first',
        'config-hide_credentials': true
      };
    } else {
      throw new Error('Kong version not supported in unit tests.')
    }

    if (semver.satisfies(process.env.KONG_VERSION, '>=0.9.0 < 0.15.0')) {
      Kong.createPlugin({
        name: 'basic-auth',
        config: {hide_credentials: false}
      });
    } else if (semver.satisfies(process.env.KONG_VERSION, '>=0.15.0 < 2.0.0')) {
      Kong.createPlugin({
        name: 'basic-auth',
        run_on: 'first',
        config: {hide_credentials: false}
      });
    }
    
    ObjectProperties.fillAndSubmit(inputs).then(() => {
      if (semver.satisfies(process.env.KONG_VERSION, '0.9.x')) {
        // Kong 0.9 returns a non-json response, causing kong-dashboard to return this misleading message.
        expect(element(by.cssContainingText('div.toast', 'Oops, something wrong happened. Please refresh the page.')).isPresent()).toBeTruthy();
      } else {
        expect(PropertyInput.isInvalid('name')).toBeTruthy();
      }
      done();
    });
  });

  function createAPI() {
    if (semver.satisfies(process.env.KONG_VERSION, '0.9.x')) {
      return Kong.createAPI({
        'name': 'my_api',
        'request_path': '/my_api',
        'upstream_url': 'http://foo'
      });
    }
    else if (semver.satisfies(process.env.KONG_VERSION, '>=0.10.0 < 0.15.0')) {
      return Kong.createAPI({
        name: 'my_api',
        hosts: ['host1.com', 'host2.com'],
        uris: ['/1.0', '/2.0'],
        methods: ['GET', 'POST'],
        upstream_url: 'http://upstream.loc',
      });
    }
    else if (semver.gte(process.env.KONG_VERSION, '0.15.0')) {
      return Promise.resolve(0); // legacy since 0.15.0
    }

    throw new Error('Kong version not supported in unit tests.')
  }
});
