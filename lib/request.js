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
  },

  delete: function(url, opts) {
    opts = opts || {};
    opts.method = 'DELETE';
    opts.url = url;
    return this.send(opts);
  },

  put: function(url, data, opts) {
    opts = opts || {};
    opts.method = 'PUT';
    opts.url = url;
    opts.json = true;
    opts.body = data;
    return this.send(opts);
  },

  post: function(url, data, opts) {
    opts = opts || {};
    opts.method = 'POST';
    opts.url = url;
    opts.json = true;
    opts.body = data;
    return this.send(opts);
  }

};

module.exports = Request;

