var Sidebar = {

  clickOn: function(text) {
    element(by.cssContainingText('ul.side-nav li a', text)).click();
  }

};

module.exports = Sidebar;
