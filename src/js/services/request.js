/**
 * Send request via local server.
 */
angular.module('app').factory('Request', ['$http', function ($http) {

  var request = function(options) {
    setOptions(options);
    return $http(options);
  };

  ['get', 'delete', 'head', 'jsonp'].forEach(function (method) {
    request[method] = function (url, options) {
      setOptions(options);
      return $http[method](options.url, options);
    };
  });

  ['post', 'put', 'patch'].forEach(function (method) {
    request[method] = function (url, data, options) {
      setOptions(options);
      return $http[method](options.url, data, options);
    };
  });

  // utils
  function setOptions(options) {
    options.headers = options.headers || {};
    options.url = './proxy' + options.endpoint;
    options.timeout = 30000;
  }

  return request;
}]);
