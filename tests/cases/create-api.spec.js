var HomePage = require('../util/home-page');
var Sidebar = require('../util/sidebar');
var ListAPIsPage = require('../util/list-apis-page');
var CreateAPIPage = require('../util/create-api-page');
var KongDashboard = require('../util/kong-dashboard-handler');
var Kong = require('../util/kong-handler');
var request = require('../../lib/request');
var using = require('jasmine-data-provider');
var AttributeField = require('../util/attribute-field');

var kd = new KongDashboard();

describe('API creation testing testing', () => {

  beforeEach((done) => {
    Kong.deleteAllAPIs().then(done);
  });

  beforeAll((done) => {
    kd.start({'--kong-url': 'http://127.0.0.1:8001'}, () => {
      HomePage.visit();
      Sidebar.clickOn('APIs');
      ListAPIsPage.clickAddButton();
      done();
    });
  });

  afterAll((done) => {
    kd.stop(done);
  });

  it('should recognize and display an input for every field', () => {
    expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/#!/apis/add');
    request.get('http://127.0.0.1:8080/config').then((response) => {
      eval(response.body);
      var fields = Object.keys(__env.schemas.api.fields);
      fields.forEach((fieldName) => {
        expect(element(by.css('#attr_' + fieldName)).isPresent()).toBeTruthy('Form section for ' + fieldName + ' is missing');
      })
    });
  });

  using(validApiInputsProvider, (data) => {
    it('should correctly behave on API creation', (done) => {
      Object.keys(data.inputs).forEach((inputName) => {
        AttributeField.set(inputName, data.inputs[inputName]);
      });
      CreateAPIPage.submit().then(() => {
        expect(element(by.cssContainingText('div.toast', 'Api created')).isPresent()).toBeTruthy();
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

  function validApiInputsProvider() {
    if (process.env.KONG_VERSION === '0.9') {
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
    throw new Error('Kong version not supported in unit tests.')
  }
});
