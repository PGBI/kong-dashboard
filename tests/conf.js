var chromeArgs = [];
if (process.env.TRAVIS) {
  chromeArgs = ["--headless", "--disable-gpu"];
}
else if (process.env.PATH != null && process.env.PATH.search(/[Ww]indows/g) != -1) {
  // override flags when running from WSL on windows station
  chromeArgs = ["--disable-gpu"];
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
