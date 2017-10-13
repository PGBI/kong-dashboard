var AttributeField = {

  title: element(by.css('h3.header')),

  getElement: (name) => {
    return element(by.css('#attr_' + name));
  },

  getElementErrorMsg: (name) => {
    return element(by.css('#attr_' + name + ' ~ div.errors'));
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
  },

  isInvalid: function (name) {
    var elt = this.getElement(name);
    return elt.getAttribute('class').then((classes) => {
      return classes.split(' ').indexOf('invalid') !== -1;
    });
  }

};

module.exports = AttributeField;
