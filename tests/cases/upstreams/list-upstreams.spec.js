var HomePage = require('../../util/HomePage');
var Sidebar = require('../../util/Sidebar');
var ListUpstreamsPage = require('../../util/ListUpstreamsPage');
var KongDashboard = require('../../util/KongDashboard');
var Kong = require('../../util/KongClient');

var kd = new KongDashboard();

describe('Upstreams listing page testing', () => {

  if (process.env.KONG_VERSION === '0.9') {
    // no upstream before Kong 0.10.
    return
  }

  beforeAll((done) => {
    kd.start({'--kong-url': 'http://127.0.0.1:8001'}, done);
  });

  afterAll((done) => {
    kd.stop(done);
  });

  it('should be possible to delete an upstream', (done) => {
    var upstream;
    Kong.createUpstream('foo.bar').then((u) => {
      upstream = u;
      HomePage.visit();
      Sidebar.clickOn('Upstreams');
      ListUpstreamsPage.clickDelete(0);
      return element(by.css('.modal h5')).getText();
    }).then((message) => {
      expect(message).toEqual('Do you really want to delete the Upstream "foo.bar"?');
      return ListUpstreamsPage.confirmDeletion();
    }).then(() => {
      expect(element(by.css('.modal')).isDisplayed()).toBeFalsy();
      return Kong.getUpstreamById(upstream.id);
    }).then((response) => {
      expect(response.message).toEqual('Not found');
      expect(ListUpstreamsPage.getRows().count()).toEqual(0);
      done();
    });
  });
});
