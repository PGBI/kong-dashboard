var Page = {

  title: element(by.css('h3.header')),

  visit: () => {
    browser.get('/');
  }

};

module.exports = Page;
