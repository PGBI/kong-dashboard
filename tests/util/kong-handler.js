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
    })
  },

  /**
   * Returns a promise that will resolve with the first API registered in Kong.
   */
  getFirstAPI: () => {
    return request.get('http://127.0.0.1:8001/apis').then((response) => {
      var apis = JSON.parse(response.body).data;
      return apis.length > 0 ? apis[0] : {};
    });
  }
};

module.exports = Kong;
