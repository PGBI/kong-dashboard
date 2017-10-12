var AttributeField = {

  title: element(by.css('h3.header')),

  getElement: (name) => {
    return element(by.css('#attr_' + name));
  },

  set: function (name, value) {
    var elt = this.getElement(name);
    if (typeof value === 'string' || typeof value === 'number') {
      elt.sendKeys(value);
    } else if (typeof value === 'boolean') {
      elt.isSelected().then((isSelected) => {
        if (isSelected !== value) {
          var label = element(by.css('label[for=attr_' + name + ']'));
          browser.actions().mouseMove(label).click().perform();
        }
      })
    } else {
      throw new Error("Invalid input value");
    }
  }

};

module.exports = AttributeField;
