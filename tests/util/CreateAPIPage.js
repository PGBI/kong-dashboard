var Page = {
  /**
   * Returns a promise that will be resolved when the form has been submitted.
   */
  submit: () => {
    return element(by.css('button[type=submit]')).click();
  }
};

module.exports = Page;
