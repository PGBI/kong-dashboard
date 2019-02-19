var HomePage = require('../util/HomePage');
var Sidebar = require('../util/Sidebar');
var ListPluginsPage = require('../util/ListPluginsPage');
var KongDashboard = require('../util/KongDashboard');
var Kong = require('../util/KongClient');

var kd = new KongDashboard();

describe('Plugin listing page testing', () => {

  beforeAll((done) => {
    kd.start({'--kong-url': 'http://127.0.0.1:8001'}, done);
  });

  afterAll((done) => {
    kd.stop(done);
  });

  beforeEach((done) => {
    Kong.deleteAllPlugins().then(done);
  });

  it('should display a "no plugin" message when there is not plugin configured', (done) => {
    Kong.deleteAllPlugins().then(() => {
      HomePage.visit();
      Sidebar.clickOn('Plugins');
      var regExp = new RegExp('.*You haven\'t created any Plugins yet..*')
      expect(element(by.cssContainingText('p', regExp)).isDisplayed()).toBeTruthy();
      done();
    });
  });

  it('should list created plugins', (done) => {
    Kong.createPlugin({
      name: 'acl',
      config: { whitelist: ['admin']}
    }).then(() => {
      HomePage.visit();
      Sidebar.clickOn('Plugins');
      expect(ListPluginsPage.getRows().count()).toEqual(1);
      expect(ListPluginsPage.getCell(0,0).getText()).toEqual('acl');
      expect(ListPluginsPage.getCell(0,1).getText()).toEqual('All');
      expect(ListPluginsPage.getCell(0,2).getText()).toEqual('All');
      done();
    });
  });

  it('should be possible to edit a plugin', (done) => {
    Kong.createPlugin({
      name: 'acl',
      config: { whitelist: ['admin']}
    }).then((plugin) => {
      HomePage.visit();
      Sidebar.clickOn('Plugins');
      ListPluginsPage.clickEdit(0);
      expect(browser.getCurrentUrl()).toEqual('http://localhost:8081/#!/plugins/' + plugin.id);
      done();
    });
  });

  it('should be possible to click delete and abort', (done) => {
    Kong.createPlugin({
      name: 'acl',
      config: { whitelist: ['admin']}
    }).then(() => {
      HomePage.visit();
      Sidebar.clickOn('Plugins');
      ListPluginsPage.clickDelete(0);
      return element(by.css('.modal h5')).getText();
    }).then((message) => {
      expect(message).toEqual('Do you really want to delete the Plugin "acl"?');
      return ListPluginsPage.abortDeletion();
    }).then(() => {
      expect(element(by.css('.modal')).isDisplayed()).toBeFalsy();
      done();
    });
  });

  it('should be possible to click delete and confirm', (done) => {
    var plugin;
    Kong.createPlugin({
      name: 'acl',
      config: { whitelist: ['admin']}
    }).then((p) => {
      plugin = p;
      HomePage.visit();
      Sidebar.clickOn('Plugins');
      ListPluginsPage.clickDelete(0);
      return element(by.css('.modal h5')).getText();
    }).then((message) => {
      expect(message).toEqual('Do you really want to delete the Plugin "acl"?');
      return ListPluginsPage.confirmDeletion();
    }).then(() => {
      expect(element(by.css('.modal')).isDisplayed()).toBeFalsy();
      return Kong.getPluginById(plugin.id);
    }).then((response) => {
      expect(response.message).toEqual('Not found');
      expect(ListPluginsPage.getRows().count()).toEqual(0);
      done();
    });
  });

});
