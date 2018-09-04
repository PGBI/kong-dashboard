var HomePage = require("../../util/HomePage");
var Sidebar = require("../../util/Sidebar");
var ListServicesPage = require("../../util/ListServicesPage");
var CreateServicePage = require("../../util/CreateServicePage");
var KongDashboard = require("../../util/KongDashboard");
var Kong = require("../../util/KongClient");
var request = require("../../../lib/request");
var PropertyInput = require('../../util/PropertyInput');
var using = require('jasmine-data-provider');
var semver = require('semver');

var kd = new KongDashboard();

describe('Service Creation testing', () => {

  if (semver.lt(process.env.KONG_VERSION, '0.13.0')) {
    // Only run tests if the Kong version is 0.13.0 or higher as Services are supported starting version 0.13 only
    return;
  }

  var serviceSchema;

  beforeEach((done) => {
    Kong.deleteAllServices().then(done);
  });

  afterEach(() => {
    browser.refresh();
  })

  beforeAll((done) => {
    kd.start({'--kong-url': 'http://127.0.0.1:8001'}, () => {
      request.get('http://127.0.0.1:8081/config').then((response) => {
        eval(response.body);
        serviceSchema = __env.schemas.service;
        done();
      });
    });
  });

  afterAll((done) => {
    kd.stop(done);
  });

  it('displays input for every field', () => {
    HomePage.visit();
    Sidebar.clickOn('Services');
    ListServicesPage.clickAddButton();
    expect(browser.getCurrentUrl()).toEqual('http://localhost:8081/#!/services/add');
    Object.keys(serviceSchema.properties).forEach((fieldName) => {
      expect(PropertyInput.getElement(fieldName).isPresent()).toBeTruthy('Form section for ' + fieldName + ' is missig');
    });
  });

  using(validServiceInputsProvider, (data) => {
    it('creates a Service', (done) => {
      HomePage.visit();
      Sidebar.clickOn('Services');
      ListServicesPage.clickAddButton();

      Object.keys(data.inputs).forEach((inputName) => {
        PropertyInput.set(inputName, data.inputs[inputName]);
      });
      CreateServicePage.submit().then(() => {
        expect(element(by.cssContainingText('div.toast', 'Service created')).isPresent()).toBeTruthy();
        return browser.waitForAngular();
      }).then(() => {
        return Kong.getFirstService();
      }).then((service) => {
        delete service.created_at
        delete service.updated_at
        delete service.id
        expect(service).toEqual(data.expectedCreatedService);
        done();
      })
    });
  });

  using(invalidServiceInputsProvider, (data) => {
    it('shows validation error on Service creation', () => {
      HomePage.visit();
      Sidebar.clickOn('Services');
      ListServicesPage.clickAddButton();

      Object.keys(data.inputs).forEach((inputName) => {
        PropertyInput.set(inputName, data.inputs[inputName]);
      });
      CreateServicePage.submit().then(() => {
        expect(element(by.cssContainingText('div.toast', 'Service created')).isPresent()).toBeFalsy();
        if (data.expectedErrors.globalError) {
          expect(element(by.cssContainingText('div.toast', data.expectedErrors.globalError)).isPresent()).toBeTruthy();
        }
        if (data.expectedErrors.properties) {
          Object.keys(serviceSchema.properties).forEach((fieldName) => {
            var expectHasErrorMessage = expect(PropertyInput.getElementErrorMsg(fieldName).isPresent());
            if (data.expectedErrors.properties.indexOf(fieldName) !== -1) {
              expectHasErrorMessage.toBeTruthy(fieldName + ' should have an error message.');
            } else {
              expectHasErrorMessage.toBeFalsy(fieldName + ' should not have an error message.');
            }
          });
        }
      });
    });
  });

  function validServiceInputsProvider() {
    return [
      {
        inputs: {
          name: 'my_awesome_Service',
          host: 'host1.com',
        },
        expectedCreatedService: {
          name: 'my_awesome_Service',
          protocol: "http",
          host: 'host1.com',
          path: null,
          port: 80,
          retries: 5,
          connect_timeout: 60000,
          write_timeout: 60000,
          read_timeout: 60000,
        }
      }
    ];
  }

  function invalidServiceInputsProvider() {
    return [
      {
        inputs: {},
        expectedErrors: {
          'globalError': 'schema violation (host: required field missing)',
          'properties': ['host']
        }
      },
      {
        inputs: {name: 'test_service'},
        expectedErrors: {
          'globalError': 'schema violation (host: required field missing)',
          'properties': ['host']
        }
      }
    ];
  }
});
