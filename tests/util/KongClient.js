var request = require('../../lib/request');

var Kong = {

  /**
   * Returns a promise that will resolve with all APIs being deleted
   */
  deleteAllAPIs: () => {
    return request.get('http://127.0.0.1:8001/apis').then((response) => {
      var apis = JSON.parse(response.body).data;
      var promises = [];
      apis.forEach((api) => {
        promises.push(request.delete('http://127.0.0.1:8001/apis/' + api.id));
      });
      return Promise.all(promises);
    });
  },

  /**
   * Returns a promise that will resolve with all Plugins being deleted
   */
  deleteAllPlugins: () => {
    return request.get('http://127.0.0.1:8001/plugins').then((response) => {
      var plugins = JSON.parse(response.body).data;
      var promises = [];
      plugins.forEach((plugin) => {
        promises.push(request.delete('http://127.0.0.1:8001/plugins/' + plugin.id));
      });
      return Promise.all(promises);
    });
  },

  /**
   * Returns a promise that will resolve with the first API registered in Kong.
   */
  getFirstAPI: () => {
    return request.get('http://127.0.0.1:8001/apis').then((response) => {
      var apis = JSON.parse(response.body).data;
      return apis.length > 0 ? apis[0] : {};
    });
  },

  /**
   * Returns a promise that will resolve with the first plugin registered in Kong.
   */
  getFirstPlugin: () => {
    return request.get('http://127.0.0.1:8001/plugins').then((response) => {
      var plugins = JSON.parse(response.body).data;
      return plugins.length > 0 ? plugins[0] : {};
    });
  },

  /**
   * Returns a promise that will resolve with the first plugin being created.
   */
  createPlugin: (data) => {
    return request.post('http://127.0.0.1:8001/plugins', data).then((response) => {
      return response.body;
    });
  },


  /**
   * Returns a promise that will resolve with the creation of an API.
   */
  createAPI: (data) => {
    return request.post('http://127.0.0.1:8001/apis', data).then((response) => {
      return response.body;
    });
  }
};

module.exports = Kong;
