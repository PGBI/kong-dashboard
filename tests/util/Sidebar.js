var Sidebar = {

  getLinkElement: function(text) {
    return element(by.cssContainingText('ul.side-nav li a', text));
  },

  clickOn: function(text) {
    return this.getLinkElement(text).click();
  }

};

module.exports = Sidebar;
