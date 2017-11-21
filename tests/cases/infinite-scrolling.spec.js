var HomePage = require('../util/home-page');
var KongDashboard = require('../util/kong-dashboard-handler');
var Kong = require('../util/KongClient');
var ListConsumersPage = require('../util/ListConsumersPage');
var ListPluginsPage = require('../util/ListPluginsPage');
var ListAPIsPage = require('../util/ListAPIsPage');
var Sidebar = require('../util/Sidebar');
var until = protractor.ExpectedConditions;


var kd = new KongDashboard();

describe('Objects page index testing', () => {

  beforeAll((done) => {
    kd.start({'--kong-url': 'http://127.0.0.1:8001'}, () => {
      Promise.all([Kong.deleteAllAPIs(), Kong.deleteAllConsumers(), Kong.deleteAllPlugins()]).then(() => {
        Promise.all([create150APIs(), create150Consumers()]).then(done);
      })
    });
  });

  afterAll((done) => {
    kd.stop(done);
  });

  it('should display 100 consumers by default', () => {
    HomePage.visit();
    Sidebar.clickOn('Consumers');
    expect(ListConsumersPage.getRows().count()).toEqual(100);
  });

  it('should display 100 plugins by default', () => {
    HomePage.visit();
    Sidebar.clickOn('Plugins');
    expect(ListPluginsPage.getRows().count()).toEqual(100);
  });

  it('should display 100 apis by default', () => {
    HomePage.visit();
    Sidebar.clickOn('APIs');
    expect(ListAPIsPage.getRows().count()).toEqual(100);
  });

  it('should reveal more consumers when scrolling down', (done) => {
    HomePage.visit();
    Sidebar.clickOn('Consumers');
    browser.executeScript('window.scrollTo(0,document.body.scrollHeight)');
    var row101 = ListConsumersPage.getRow(101);
    browser.wait(until.presenceOf(row101)).then(() => {
      expect(ListConsumersPage.getRows().count()).toEqual(150);
      done();
    });
  });

  it('should reveal more plugins when scrolling down', (done) => {
    HomePage.visit();
    Sidebar.clickOn('Plugins');
    browser.executeScript('window.scrollTo(0,document.body.scrollHeight)');
    var row101 = ListPluginsPage.getRow(101);
    browser.wait(until.presenceOf(row101)).then(() => {
      expect(ListPluginsPage.getRows().count()).toEqual(150);
      done();
    });
  });

  it('should reveal more apis when scrolling down', (done) => {
    HomePage.visit();
    Sidebar.clickOn('APIs');
    browser.executeScript('window.scrollTo(0,document.body.scrollHeight)');
    var row101 = ListAPIsPage.getRow(101);
    browser.wait(until.presenceOf(row101)).then(() => {
      expect(ListAPIsPage.getRows().count()).toEqual(150);
      done();
    });
  });
});

function create150APIs() {
  var promise = createAPI(0);

  for (var i = 1; i < 150; i++) {
    let n = i;
    promise = promise.then(() => {
      return createAPI(n);
    });
  }

  return promise;
}

function createAPI(number) {
  if (process.env.KONG_VERSION === '0.9') {
    return Kong.createAPI({
      'name': 'api_' + number,
      'request_path': '/' + number,
      'upstream_url': 'http://foo'
    }).then((api) => {
      return Kong.createPlugin({
        'name': 'basic-auth',
        'api_id': api.id
      })
    });
  }

  if (process.env.KONG_VERSION === '0.10' || process.env.KONG_VERSION === '0.11') {
    return Kong.createAPI({
      'name': 'api_' + number,
      'uris': ['/' + number],
      'upstream_url': 'http://foo'
    }).then((api) => {
      return Kong.createPlugin({
        'name': 'basic-auth',
        'api_id': api.id
      })
    });
  }

  throw new Error('Kong version not supported in unit tests.')
}


function create150Consumers() {
  var promise = Kong.createConsumer({
    custom_id: 'my_custom_id_0'
  });

  for (var i = 1; i < 150; i++) {
    let n = i;
    promise = promise.then(() => {
      return Kong.createConsumer({
        custom_id: 'my_custom_id_' + n
      });
    });
  }

  return promise;
}
