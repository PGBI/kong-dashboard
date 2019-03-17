var HomePage = require('../util/HomePage');
var KongDashboard = require('../util/KongDashboard');
var Kong = require('../util/KongClient');
var ListConsumersPage = require('../util/ListConsumersPage');
var ListPluginsPage = require('../util/ListPluginsPage');
var ListAPIsPage = require('../util/ListAPIsPage');
var ListServicesPage = require('../util/ListServicesPage');
var Sidebar = require('../util/Sidebar');
var until = protractor.ExpectedConditions;
var semver = require('semver');

var kd = new KongDashboard();

describe('Objects page index testing', () => {

  beforeAll((done) => {
    kd.start({'--kong-url': 'http://127.0.0.1:8001'}, () => {
      Promise.all([Kong.deleteAllAPIs(), Kong.deleteAllServices(), Kong.deleteAllConsumers(), Kong.deleteAllPlugins()]).then(() => {
        Promise.all([create150APIs(), create150Services(), create150Consumers()]).then(done);
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

  it('should display 100 apis by default', (done) => {
    if (semver.gte(process.env.KONG_VERSION, '0.15.0')) {
      return done(); // legacy since 0.15.0
    }
    HomePage.visit();
    Sidebar.clickOn('APIs');
    expect(ListAPIsPage.getRows().count()).toEqual(100);
    done();
  });

  it('should display 100 services by default', (done) => {
    if (semver.lt(process.env.KONG_VERSION, '0.13.0')) {
      return done(); // first introduced in 0.13.0
    }
    HomePage.visit();
    Sidebar.clickOn('Services');
    expect(ListServicesPage.getRows().count()).toEqual(100);
    done();
  });

  it('should reveal more consumers when scrolling down', (done) => {
    HomePage.visit();
    Sidebar.clickOn('Consumers');
    browser.waitForAngular().then(() => {
      browser.executeScript('window.scrollTo(0,document.body.scrollHeight)');
    });
    var row101 = ListConsumersPage.getRow(101);
    browser.wait(until.presenceOf(row101)).then(() => {
      expect(ListConsumersPage.getRows().count()).toEqual(150);
      done();
    });
  });

  it('should reveal more plugins when scrolling down', (done) => {
    HomePage.visit();
    Sidebar.clickOn('Plugins');
    browser.waitForAngular().then(() => {
      browser.executeScript('window.scrollTo(0,document.body.scrollHeight)');
    });
    var row101 = ListPluginsPage.getRow(101);
    browser.wait(until.presenceOf(row101)).then(() => {
      expect(ListPluginsPage.getRows().count()).toEqual(150);
      done();
    });
  });

  it('should reveal more apis when scrolling down', (done) => {
    if (semver.gte(process.env.KONG_VERSION, '0.15.0')) {
      return done(); // legacy since 0.15.0
    }
    HomePage.visit();
    Sidebar.clickOn('APIs');
    browser.waitForAngular().then(() => {
      browser.executeScript('window.scrollTo(0,document.body.scrollHeight)');
    });
    var row101 = ListAPIsPage.getRow(101);
    browser.wait(until.presenceOf(row101)).then(() => {
      expect(ListAPIsPage.getRows().count()).toEqual(150);
      done();
    });
  });

  it('should reveal more services when scrolling down', (done) => {
    if (semver.lt(process.env.KONG_VERSION, '0.13.0')) {
      return done(); // first introduced in 0.13.0
    }
    HomePage.visit();
    Sidebar.clickOn('Services');
    browser.waitForAngular().then(() => {
      browser.executeScript('window.scrollTo(0,document.body.scrollHeight)');
    });
    var row101 = ListServicesPage.getRow(101);
    browser.wait(until.presenceOf(row101)).then(() => {
      expect(ListServicesPage.getRows().count()).toEqual(150);
      done();
    });
  });
});

function create150APIs() {
  if (semver.gte(process.env.KONG_VERSION, '0.15.0')) {
    return Promise.resolve(0); // legacy since 0.15.0
  }
  var promise = createAPI(0);

  for (var i = 1; i < 150; i++) {
    let n = i;
    promise = promise.then(() => {
      return createAPI(n);
    });
  }

  return promise;
}

function create150Services() {
  if (semver.lt(process.env.KONG_VERSION, '0.13.0')) {
    return Promise.resolve(0); // first introduced in 0.13.0
  }

  var promise = createService(0);

  for (var i = 1; i < 150; i++) {
    let n = i;
    promise = promise.then(() => {
      return createService(n);
    });
  }

  return promise;
}

function createService(number) {  
  if (semver.lt(process.env.KONG_VERSION, '0.13.0')) {
    throw new Error('Kong version not supported in unit current test.')
  }

  let servicePromise;  
  servicePromise =  Kong.createService({
    name: 'service_' + number,
    protocol: `http`,
    host: `localhost`,
    port: 80
  });
  
  return servicePromise.then((svc) => {
    return Kong.createPlugin({
      name: 'basic-auth',
      run_on: 'first',
      service: {id: svc.id}
    })
  });
}

function createAPI(number) {
  let apiPromise;
  if (semver.satisfies(process.env.KONG_VERSION, '0.9.x')) {
    apiPromise = Kong.createAPI({
      name: 'api_' + number,
      request_path: '/' + number,
      upstream_url: 'http://foo'
    });
  }
  else if (semver.satisfies(process.env.KONG_VERSION, '>=0.10.0 < 0.15.0')) {
    apiPromise =  Kong.createAPI({
      name: 'api_' + number,
      uris: ['/' + number],
      upstream_url: 'http://foo'
    });
  }
  else {
    throw new Error('Kong version not supported in unit tests.')
  }

  return apiPromise.then((api) => {
    return Kong.createPlugin({
      name: 'basic-auth',
      api_id: api.id
    })
  });
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
