var HomePage = require('../util/HomePage');
var Sidebar = require('../util/Sidebar');
var KongDashboard = require('../util/KongDashboard');
var semver = require('semver');

var kd = new KongDashboard();

describe('Sidebar testing', () => {

  beforeAll((done) => {
    kd.start({'--kong-url': 'http://127.0.0.1:8001'}, done);
  });

  afterAll((done) => {
    kd.stop(done);
  });

  it('should display Certificates links depending on Kong version', () => {
    HomePage.visit();
    if (semver.satisfies(process.env.KONG_VERSION, '0.9.x')) {
      expect(Sidebar.getLinkElement('Certificates').isPresent()).toBeFalsy();
    }
    else if (semver.satisfies(process.env.KONG_VERSION, '>=0.10.0 < 2.0.0')) {
      expect(Sidebar.getLinkElement('Certificates').isPresent()).toBeTruthy();
    }
    else {
      throw new Error('Kong version not supported in unit tests.')
    }
  });

});
