var PropertyInput = require('./property-input');
var PluginPage = require

var ObjectProperties = {

  /**
   * Return a promise that will resolve in an objectProperties form being filled and submitted.
   * @param inputs
   * @returns {Promise.<T>|*}
   */
  fillAndSubmit: (inputs) => {
    var promises = [];
    Object.keys(inputs).forEach((inputName) => {
      promises.push(PropertyInput.set(inputName, inputs[inputName]).catch((reason) => {
        throw 'Failure in setting ' + inputs[inputName] + ' to ' + inputName;
      }));
    });
    return Promise.all(promises).then(() => {
      return element(by.css('button[type=submit]')).click();
    }).then(() => {
      return browser.waitForAngular();
    });
  }

};

module.exports = ObjectProperties;
