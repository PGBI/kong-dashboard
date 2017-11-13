var HomePage = require('../util/home-page');
var Sidebar = require('../util/sidebar');
var ListPluginsPage = require('../util/ListPluginsPage');
var KongDashboard = require('../util/kong-dashboard-handler');
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

  it('should display a "no plugin" message when there is not plugin configured', () => {
    HomePage.visit();
    Sidebar.clickOn('Plugins');
    expect(element(by.cssContainingText('p', ' There are no plugin configured yet.')).isDisplayed()).toBeTruthy();
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
      expect(browser.getCurrentUrl()).toEqual('http://localhost:8080/#!/plugins/' + plugin.id);
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
      expect(message).toEqual('Do you really want to delete the plugin "acl"?');
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
      expect(message).toEqual('Do you really want to delete the plugin "acl"?');
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
