var Page = {

  visit: (pluginId) => {
    return browser.get('/#!/plugins/' + pluginId);
  }
};

module.exports = Page;
