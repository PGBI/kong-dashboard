/**
 * Send request via local server.
 */
angular.module('app')
    .factory('Request', ['$http', '$cookies', function ($http, $cookies) {
      var kongNodeURLHeader = 'Kong-Node-URL';

      function request (options) {
        options = addKongNodeURLHeader(options.url, options);
        options.url = getRelativePath(options.url);
        return $http(options);
      };

      ['get', 'delete', 'head', 'jsonp'].forEach(function (method) {
        request[method] = function (url, options) {
          options = addKongNodeURLHeader(url, options || {});
          return $http[method](getRelativePath(url), options);
        };
      });

      ['post', 'put', 'patch'].forEach(function (method) {
        request[method] = function (url, data, options) {
          options = addKongNodeURLHeader(url, options || {});
          return $http[method](getRelativePath(url), data, options);
        };
      });

      // utils
      function addKongNodeURLHeader (url, options) {
        options.headers = options.headers || {};
        options.headers[kongNodeURLHeader] = url.match(/^(https?:)?\/\/[^\/]*/)[0];
        return options;
      }

      function getRelativePath (url) {
        return url.replace(/^(https?:)?\/\/[^\/]*/, '') || '/';
      }

      return request;
    }]);
