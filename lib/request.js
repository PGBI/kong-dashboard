var request = require('request');

var Request = {

  send: function(opts) {
    return new Promise((resolve, reject) => {
      request(opts, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      })
    })
  },

  get: function(url, opts) {
    opts = opts || {};
    opts.method = 'GET';
    opts.url = url;
    return this.send(opts);
  }

};

module.exports = Request;

