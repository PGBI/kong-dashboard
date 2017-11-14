var HomePage = require('../util/home-page');
var Sidebar = require('../util/Sidebar');
var KongDashboard = require('../util/kong-dashboard-handler');

var kd = new KongDashboard();

describe('Sidebar testing', () => {

  beforeAll((done) => {
    kd.start({'--kong-url': 'http://127.0.0.1:8001'}, done);
  });

  afterAll((done) => {
    kd.stop(done);
  });

  it('should display SNIs and Certificates links depending on Kong version', () => {
    HomePage.visit();
    if (process.env.KONG_VERSION === '0.9') {
      expect(Sidebar.getLinkElement('SNIs').isPresent()).toBeFalsy();
      expect(Sidebar.getLinkElement('Certificates').isPresent()).toBeFalsy();
    }
    else if (process.env.KONG_VERSION === '0.10' || process.env.KONG_VERSION === '0.11') {
      expect(Sidebar.getLinkElement('SNIs').isPresent()).toBeTruthy();
      expect(Sidebar.getLinkElement('Certificates').isPresent()).toBeTruthy();
    }
    else {
      throw new Error('Kong version not supported in unit tests.')
    }
  });

});
