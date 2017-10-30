var PropertyInput = {

  title: element(by.css('h3.header')),

  getElement: (name) => {
    return element(by.css("#property-" + name));
  },

  getElementErrorMsg: (name) => {
    return element(by.css("#property-" + name + ' ~ div.errors'));
  },

  set: function (name, value) {
    var elt = this.getElement(name);
    if (typeof value === 'string' || typeof value === 'number') {
      elt.sendKeys(value);
    } else if (typeof value === 'boolean') {
      elt.isSelected().then((isSelected) => {
        if (isSelected !== value) {
          var label = element(by.css('label[for=property-' + name + ']'));
          browser.actions().mouseMove(label).click().perform();
        }
      })
    } else if (Array.isArray(value)) {
      elt.getTagName().then((tagName) => {
        if (tagName === 'input') {
          elt.sendKeys(value.join());
        } else if (tagName === 'select') {
          elt.element(by.xpath("..")).element(by.css('input.select-dropdown')).click();
          value.forEach((val) => {
            elt.element(by.xpath("..")).element(by.cssContainingText('li', val)).click();
          });
          browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        } else {
          throw "Don't know how to fill in " + tagName;
        }
      });
    } else {
      throw new Error("Invalid input value " + name + " of type " + typeof value);
    }
  },

  isInvalid: function (name) {
    var elt = this.getElement(name);
    return elt.getAttribute('class').then((classes) => {
      return classes.split(' ').indexOf('invalid') !== -1;
    });
  }

};

module.exports = PropertyInput;
