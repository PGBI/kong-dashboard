var HomePage = require('../util/home-page');
var Sidebar = require('../util/sidebar');
var ListAPIsPage = require('../util/list-apis-page');
var KongDashboard = require('../util/kong-dashboard-handler');
var request = require('../../lib/request');

var kd = new KongDashboard();

describe('API creation testing testing', () => {

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
});
