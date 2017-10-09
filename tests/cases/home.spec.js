var HomePage = require('../util/home-page');
var KongDashboard = require('../util/kong-dashboard-handler');

var kd = new KongDashboard();

describe('Homepage testing', () => {

  beforeAll((done) => {
    kd.start({'--kong-url': 'http://127.0.0.1:8001'}, done);
  });

  afterAll((done) => {
    kd.stop(done);
  });

  it('should be possible to reach the home page', () => {
    HomePage.visit();
    expect(HomePage.title.getText()).toEqual('Welcome to Kong Dashboard');
  });

});
