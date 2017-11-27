var chromeArgs = [];
if (process.env.TRAVIS) {
  chromeArgs = ["--headless", "--disable-gpu"];
}

exports.config = {
  directConnect: true,
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  },
  specs: ['./**/*.spec.js'],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: chromeArgs
    }
  },
  baseUrl: 'http://localhost:8081'
};
