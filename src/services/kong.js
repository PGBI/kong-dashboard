/**
 * This factory handles CRUD requests to the backend API.
 */
angular.module('app')
  .factory('Kong', ['$http', '$q', 'Request', 'Alert', function ($http, $q, Request, Alert) {
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
      factory[method] = function (endpoint, muteErrors, deferred) {
        deferred = deferred || $q.defer();
        try {
          Request({
            endpoint: endpoint,
            method: method
          }).then(function (response) {
            deferred.resolve(response.data);
          }, function (response) {
            if (response.status == 500) {
              // Kong internal error. Let's retry.
              return factory[method](endpoint, muteErrors, deferred);
            }
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

    /**
     * In case of a 400 response, Kong returns validation errors in the following form:
     * {
     *   field1: "error message for field1",
     *   config.nested_field: "error message for nested field"
     * }
     * This method takes this object and transform it into that format:
     * {
     *   field1: "error message for field1",
     *   config: {
     *     nested_field: "error message for nested field"
     *   }
     * }
     */
    factory.unflattenErrorResponse = function(kongResponseBody) {
      if (Object(kongResponseBody) !== kongResponseBody || Array.isArray(kongResponseBody)) {
        return kongResponseBody;
      }

      // In case of 400 error, Kong response is inconsistent. Sometimes the errored fields are wrapped within an
      // object whose key is "fields", sometimes not.
      var errors = kongResponseBody.fields || kongResponseBody;

      var result = {}, cur, prop, idx, last, temp;
      for(var p in errors) {
        cur = result, prop = "", last = 0;
        do {
          idx = p.indexOf(".", last);
          temp = p.substring(last, idx !== -1 ? idx : undefined);
          cur = cur[prop] || (cur[prop] = (!isNaN(parseInt(temp)) ? [] : {}));
          prop = temp;
          last = idx + 1;
        } while(idx >= 0);
        cur[prop] = errors[p];
      }
      return result[""];
    };

    return factory;
  }]);
