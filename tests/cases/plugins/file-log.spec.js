var HomePage = require('../../util/HomePage');
var Sidebar = require('../../util/Sidebar');
var PluginPage = require('../../util/PluginPage');
var ListPluginsPage = require('../../util/ListPluginsPage');
var KongDashboard = require('../../util/KongDashboard');
var Kong = require('../../util/KongClient');
var PropertyInput = require('../../util/PropertyInput');
var ObjectProperties = require('../../util/ObjectProperties');

var kd = new KongDashboard();

describe('File Log plugin testing', () => {

  beforeAll((done) => {
    kd.start({'--kong-url': 'http://127.0.0.1:8001'}, () => {
      done();
    });
  });

  afterAll((done) => {
    kd.stop(done);
  });

  beforeEach((done) => {
    Kong.deleteAllPlugins().then(done);
  });

  it("should error when path isn't set", (done) => {
    HomePage.visit();
    Sidebar.clickOn('Plugins');
    ListPluginsPage.clickAddButton();
    ObjectProperties.fillAndSubmit({'name': 'file-log'}).then(() => {
      expect(PropertyInput.isInvalid('config-path')).toBeTruthy();
      done();
    });
  });

});
