/**
 * This factory handles CRUD requests to the backend API.
 */
angular.module('app')
  .factory('Kong', ['$http', '$q', 'Request', 'Alert', 'env', function ($http, $q, Request, Alert, env) {
    var factory = {
      handleError: function (response, deferred, muteErrors) {
        if (response && response.data) {
          deferred.reject(response);
          if (response.data.message && !muteErrors) {
            Alert.error(response.data.message);
          }
        } else {
          console.log(response);
          Alert.error("Oops, something wrong happened. Please refresh the page.");
          deferred.reject();
        }
      }
    };

    ['get', 'delete', 'head'].forEach(function (method) {
      factory[method] = function (endpoint, muteErrors) {
        var deferred = $q.defer();
        try {
          Request({
            endpoint: endpoint,
            method: method
          }).then(function (response) {
            deferred.resolve(response.data);
          }, function (response) {
            factory.handleError(response, deferred, muteErrors);
          });
        } catch(err) {
          factory.handleError(err, deferred);
        }
        return deferred.promise;
      };
    });

    ['post', 'put', 'patch'].forEach(function (method) {
      factory[method] = function (endpoint, data) {
        var deferred = $q.defer();
        try {
          Request({
            endpoint: endpoint,
            method: method,
            data: data,
          }).then(function (response) {
            deferred.resolve(response.data);
          }, function (response) {
            factory.handleError(response, deferred);
          });
        } catch(err) {
          factory.handleError(err, deferred);
        }
        return deferred.promise;
      };
    });

    return factory;
  }]);
