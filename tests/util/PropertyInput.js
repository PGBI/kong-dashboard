var until = protractor.ExpectedConditions;

var PropertyInput = {

  title: element(by.css('h3.header')),

  getElement: (name) => {
    return element(by.css("#property-" + name));
  },

  getElementErrorMsg: (name) => {
    return element(by.css("#error-" + name));
  },

  set: function (name, value) {
    var elt = this.getElement(name);
    if (typeof value === 'number') {
      elt.clear();
      return elt.sendKeys(value);
    }

    if (typeof value === 'string') {
      return elt.getTagName().then((tagName) => {
        if (tagName === 'input') {
          elt.clear();
          return elt.sendKeys(value);
        } else if (tagName === 'select') {
          var dropdown = elt.element(by.xpath("..")).element(by.css('input.select-dropdown'));
          var li = elt.element(by.xpath("..")).element(by.cssContainingText('li', value));
          return dropdown.click().then(() => {
            return browser.wait(until.presenceOf(li));
          }).then(() => {
            return browser.executeScript("arguments[0].scrollIntoView()", li);
          }).then(() => {
            return li.click();
          });
        } else {
          throw "Don't know how to fill in " + tagName;
        }
      });
    }

    if (typeof value === 'boolean') {
      return elt.isSelected().then((isSelected) => {
        if (isSelected !== value) {
          var label = element(by.css('label[for=property-' + name + ']'));
          return browser.actions().mouseMove(label).click().perform();
        }
      })
    }

    if (Array.isArray(value)) {
      return elt.getTagName().then((tagName) => {
        if (tagName === 'input') {
          return elt.sendKeys(value.join());
        } else if (tagName === 'select') {
          return elt.element(by.xpath("..")).element(by.css('input.select-dropdown')).click().then(() => {
            var promises = [];
            value.forEach((val) => {
              promises.push(elt.element(by.xpath("..")).element(by.cssContainingText('li', val)).click());
            });
            return Promise.all(promises).then(() => {
              return browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
            });
          });
        } else {
          throw "Don't know how to fill in " + tagName;
        }
      });
    }

    throw new Error("Invalid input value " + name + " of type " + typeof value);
  },

  isInvalid: function (name) {
    return this.getElementErrorMsg(name).isDisplayed();
  }

};

module.exports = PropertyInput;
