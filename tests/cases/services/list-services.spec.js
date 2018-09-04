var HomePage = require("../../util/HomePage");
var Sidebar = require("../../util/Sidebar");
var ListServicesPage = require("../../util/ListServicesPage");
var KongDashboard = require("../../util/KongDashboard");
var Kong = require("../../util/KongClient");
var PropertyInput = require('../../util/PropertyInput');
var semver = require('semver');

var kd = new KongDashboard();

describe('Service Listing page testing', () => {
  if (semver.lt(process.env.KONG_VERSION, '0.13.0')) {
    // Only run tests if the Kong version is 0.13.0 or higher as Services are supported starting version 0.13 only
    return;
  }

  beforeEach((done) => {
    Kong.deleteAllServices().then(done);
  });

  beforeAll((done) => {
    kd.start({'--kong-url': 'http://127.0.0.1:8001'}, done);
  });

  afterAll((done) => {
    kd.stop(done);
  });

  it ('displays the services', (done) => {
    var serviceData = {name: 'test_service', host: 'a.com'};

    Kong.createService(serviceData).then(() => {
      HomePage.visit();
      Sidebar.clickOn("Services");
      expect(ListServicesPage.getRows().count()).toEqual(1);
      done();
    });
  });

  it ('can delete a service', (done) => {
    var serviceData = {name: 'test_service', host: 'a.com'};
    var service;

    Kong.createService(serviceData).then((s) => {
      service = s;
      HomePage.visit();
      Sidebar.clickOn("Services");
      ListServicesPage.clickDelete(0);
      return element(by.css('.modal h5')).getText();
    }).then((message) => {
      expect(message).toEqual('Do you really want to delete the Service "test_service"?');
      return ListServicesPage.confirmDeletion();
    }).then(() => {
      expect(element(by.css('.modal')).isDisplayed()).toBeFalsy();
      return Kong.getServiceById(service.id);
    }).then((response) => {
      expect(response.message).toEqual('Not found');
      expect(ListServicesPage.getRows().count()).toEqual(0);
      done();
    });
  });

  it ('can edit a service', (done) => {
    var serviceData = {name: 'test_service', host: 'a.com'};
    var service;

    Kong.createService(serviceData).then((s) => {
      service = s;
      HomePage.visit();
      Sidebar.clickOn("Services");
      ListServicesPage.clickEdit(0);
      PropertyInput.get('name').then((value) => {
        expect(value).toEqual(serviceData.name);
      });
      done();
    });
  });
});
