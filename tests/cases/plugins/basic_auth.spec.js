var HomePage = require('../../util/home-page');
var Sidebar = require('../../util/sidebar');
var PluginPage = require('../../util/PluginPage');
var ListPluginsPage = require('../../util/list-plugins-page');
var KongDashboard = require('../../util/kong-dashboard-handler');
var Kong = require('../../util/KongClient');
var PropertyInput = require('../../util/PropertyInput');
var ObjectProperties = require('../../util/ObjectProperties');

var kd = new KongDashboard();

describe('Basic Auth plugin testing', () => {

  var api;

  beforeAll((done) => {
    kd.start({'--kong-url': 'http://127.0.0.1:8001'}, () => {
      Kong.deleteAllAPIs().then(() => {
        return createAPI();
      }).then((response) => {
        api = response;
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

  it('should be successfully create basic auth plugin for All APIs', (done) => {
    HomePage.visit();
    Sidebar.clickOn('Plugins');
    ListPluginsPage.clickAddButton();

    var inputs;
    var expectedPluginParams;

    if (process.env.KONG_VERSION === '0.9') {
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
    } else if (process.env.KONG_VERSION === '0.10' || process.env.KONG_VERSION === '0.11') {
      inputs = {
        'name': 'basic-auth',
        'api_id': 'All',
        'config-hide_credentials': true,
        'config-anonymous': 'anonymous'
      };
      expectedPluginParams = {
        'name': 'basic-auth',
        'config': {'hide_credentials': true, 'anonymous': 'anonymous'},
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

  it('should be successfully create a basic-auth plugin for one API', (done) => {
    HomePage.visit();
    Sidebar.clickOn('Plugins');
    ListPluginsPage.clickAddButton();

    if (process.env.KONG_VERSION === '0.9') {
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
    } else if (process.env.KONG_VERSION === '0.10' || process.env.KONG_VERSION === '0.11') {
      inputs = {
        'name': 'basic-auth',
        'api_id': api.name,
        'config-hide_credentials': true,
        'config-anonymous': 'anonymous'
      };
      expectedPluginParams = {
        'api_id': api.id,
        'name': 'basic-auth',
        'config': {'hide_credentials': true, 'anonymous': 'anonymous'},
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
      if (process.env.KONG_VERSION === '0.9') {
        expect(updatedPlugin.config).toEqual({'hide_credentials': true});
      } else {
        expect(updatedPlugin.config).toEqual({'hide_credentials': true, 'anonymous': ''});
      }
      done();
    });
  });

  it('should error when attempting to create a basic-auth plugin if an other one already exists', (done) => {
    HomePage.visit();
    Sidebar.clickOn('Plugins');
    ListPluginsPage.clickAddButton();

    var inputs = {
      'name': 'basic-auth',
      'api_id': 'All',
      'config-hide_credentials': true
    };

    Kong.createPlugin({
      name: 'basic-auth',
      config: {hide_credentials: false}
    });
    ObjectProperties.fillAndSubmit(inputs).then(() => {
      if (process.env.KONG_VERSION === '0.9') {
        // Kong 0.9 returns a non-json response, causing kong-dashboard to return this misleading message.
        expect(element(by.cssContainingText('div.toast', 'Oops, something wrong happened. Please refresh the page.')).isPresent()).toBeTruthy();
      } else {
        expect(PropertyInput.isInvalid('name')).toBeTruthy();
      }
      done();
    });
  });

  function createAPI() {
    if (process.env.KONG_VERSION === '0.9') {
      return Kong.createAPI({
        'name': 'my_api',
        'request_path': '/my_api',
        'upstream_url': 'http://foo'
      });
    }

    if (process.env.KONG_VERSION === '0.10' || process.env.KONG_VERSION === '0.11') {
      return Kong.createAPI({
        name: 'my_api',
        hosts: ['host1.com', 'host2.com'],
        uris: ['/1.0', '/2.0'],
        methods: ['GET', 'POST'],
        upstream_url: 'http://upstream.loc',
      });
    }

    throw new Error('Kong version not supported in unit tests.')
  }
});
