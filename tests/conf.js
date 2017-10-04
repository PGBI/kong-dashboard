exports.config = {
  directConnect: true,
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true
  },
  specs: ['./**/*.spec.js'],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [
        "--headless",
        "--disable-gpu"
      ]
    }
  },
  baseUrl: 'http://localhost:8080'
};
