var HomePage = require('../util/HomePage');
var Sidebar = require('../util/Sidebar');
var ListAPIsPage = require('../util/ListAPIsPage');
var CreateAPIPage = require('../util/CreateAPIPage');
var KongDashboard = require('../util/KongDashboard');
var Kong = require('../util/KongClient');
var request = require('../../lib/request');
var using = require('jasmine-data-provider');
var PropertyInput = require('../util/PropertyInput');
var semver = require('semver');

var kd = new KongDashboard();

describe('API creation testing', () => {
  if (semver.gte(process.env.KONG_VERSION, '0.15.0')) {
    return; // legacy since 0.15.0
  }

  var apiSchema;

  beforeEach((done) => {
    Kong.deleteAllAPIs().then(done);
  });

  afterEach(() => {
    browser.refresh();
  });

  beforeAll((done) => {
    kd.start({'--kong-url': 'http://127.0.0.1:8001'}, () => {
      request.get('http://127.0.0.1:8081/config').then((response) => {
        eval(response.body);
        apiSchema = __env.schemas.api;
        done();
      });
    });
  });

  afterAll((done) => {
    kd.stop(done);
  });

  it('should recognize and display an input for every field', () => {
    HomePage.visit();
    Sidebar.clickOn('APIs');
    ListAPIsPage.clickAddButton();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:8081/#!/apis/add');
    Object.keys(apiSchema.properties).forEach((fieldName) => {
      expect(PropertyInput.getElement(fieldName).isPresent()).toBeTruthy('Form section for ' + fieldName + ' is missing');
    })
  });

  using(validApiInputsProvider, (data) => {
    it('should correctly create an API', (done) => {
      HomePage.visit();
      Sidebar.clickOn('APIs');
      ListAPIsPage.clickAddButton();

      Object.keys(data.inputs).forEach((inputName) => {
        PropertyInput.set(inputName, data.inputs[inputName]);
      });

      CreateAPIPage.submit().then(() => {
        expect(element(by.cssContainingText('div.toast', 'API created')).isPresent()).toBeTruthy();
        return browser.waitForAngular(); // waiting for ajax call to create API to be finished.
      }).then(() => {
        return Kong.getFirstAPI();
      }).then((api) => {
        delete api.created_at;
        delete api.id;
        expect(api).toEqual(data.expectedCreatedAPI);
        done();
      });
    })
  });

  using(invalidApiInputsProvider, (data) => {
    it('should correctly show validation error on API creation', (done) => {
      HomePage.visit();
      Sidebar.clickOn('APIs');
      ListAPIsPage.clickAddButton();

      Object.keys(data.inputs).forEach((inputName) => {
        PropertyInput.set(inputName, data.inputs[inputName]);
      });

      CreateAPIPage.submit().then(() => {
        expect(element(by.cssContainingText('div.toast', 'Api created')).isPresent()).toBeFalsy();
        if (data.expectedErrors.globalError) {
          expect(element(by.cssContainingText('div.toast', data.expectedErrors.globalError)).isPresent()).toBeTruthy();
        }
        if (data.expectedErrors.properties) {
          Object.keys(apiSchema.properties).forEach((fieldName) => {
            var expectHasErrorMessage = expect(PropertyInput.getElementErrorMsg(fieldName).isPresent());
            if (data.expectedErrors.properties.indexOf(fieldName) !== -1) {
              expectHasErrorMessage.toBeTruthy(fieldName + ' should have an error message.');
            } else {
              expectHasErrorMessage.toBeFalsy(fieldName + ' should not have an error message.');
            }
          });
        }
        done();
      });
    })
  });

  function validApiInputsProvider() {
    if (semver.satisfies(process.env.KONG_VERSION, '0.9.x')) {
      return [
        {
          inputs: {
            name: 'my_api',
            request_host: 'host',
            upstream_url: 'http://upstream.loc'
          },
          expectedCreatedAPI: {
            name: 'my_api',
            request_host: 'host',
            upstream_url: 'http://upstream.loc',
            strip_request_path: false,
            preserve_host: false
          }
        },
        {
          inputs: {
            name: 'my_api2',
            request_path: '/1.0',
            upstream_url: 'http://upstream2.loc',
            strip_request_path: true,
            preserve_host: true
          },
          expectedCreatedAPI: {
            name: 'my_api2',
            request_path: '/1.0',
            upstream_url: 'http://upstream2.loc',
            strip_request_path: true,
            preserve_host: true
          }
        }
      ];
    }
    else if (semver.satisfies(process.env.KONG_VERSION, '>=0.10.0 < 0.15.0')) {
      return [
        {
          inputs: {
            name: 'my_awesome_API',
            hosts: ['host1.com', 'host2.com'],
            uris: ['/1.0', '/2.0'],
            methods: ['GET', 'POST'],
            upstream_url: 'http://upstream.loc',
            strip_uri: false,
            http_if_terminated: true
          },
          expectedCreatedAPI: {
            name: 'my_awesome_API',
            hosts: ['host1.com', 'host2.com'],
            uris: ['/1.0', '/2.0'],
            methods: ['GET', 'POST'],
            upstream_url: 'http://upstream.loc',
            strip_uri: false,
            preserve_host: false,
            retries: 5,
            upstream_connect_timeout: 60000,
            upstream_send_timeout: 60000,
            upstream_read_timeout: 60000,
            https_only: false,
            http_if_terminated: true
          }
        }
      ];
    }

    throw new Error('Kong version not supported in unit tests.')
  }

  function invalidApiInputsProvider() {
    if (semver.satisfies(process.env.KONG_VERSION, '0.9.x')) {
      return [
        {
          inputs: {},
          expectedErrors: {'properties': ['request_host', 'request_path', 'upstream_url']}
        }
      ];
    }
    else if (semver.satisfies(process.env.KONG_VERSION, '>=0.10.0 < 0.15.0')) {
      return [
        {
          inputs: {},
          expectedErrors: {'properties': ['name', 'upstream_url']}
        },
        {
          inputs: {name: 'hello', upstream_url: 'http://goo'},
          expectedErrors: {'globalError': "at least one of 'hosts', 'uris' or 'methods' must be specified"}
        }
      ];
    }

    throw new Error('Kong version not supported in unit tests.')
  }
});
