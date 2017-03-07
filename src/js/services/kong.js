/**
 * This factory handles CRUD requests to the backend API.
 */
angular.module('app')
    .factory('Kong', ['$http', '$q', '$cookies', 'Request', 'Alert', function ($http, $q, $cookies, Request, Alert) {
        var config = {
            url : $cookies.getObject('config.url'),
            auth : { type : "no_auth" },
            gelato : $cookies.getObject('config.gelato')
        };

        var factory = {
            config: config,

            handleError: function (response, deferred, endpoint) {
                if (response && response.data) {
                    if (response.data.message) {
                        Alert.error(response.data.message);
                        deferred.reject();
                    } else {
                        deferred.reject(response);
                    }
                } else {
                    console.log(response);
                    Alert.error("Oops, something wrong happened. Please refresh the page.");
                    deferred.reject();
                }
            },

            checkConfig: function (config) {
                var url = config.url;
                if (config.auth.type === 'basic_auth') {
                    var auth_string = btoa(config.auth.username + ':' + config.auth.password);
                    $http.defaults.headers.common['x-kong-authorization'] = 'Basic ' + auth_string;
                } else {
                    delete $http.defaults.headers.common['x-kong-authorization'];
                }
                var deferred = $q.defer();
                if (!url) {
                    deferred.reject('No URL');
                    return deferred.promise;
                }

                try {
                    Request({
                        kong_url: url,
                        endpoint: '/',
                        method: 'GET'
                    }).then(function (response) {
                        if (
                            response && response.data && response.data.tagline
                            && angular.isString(response.data.tagline)
                            && response.data.tagline.toLowerCase() == "welcome to kong"
                        ) {
                            deferred.resolve();
                        } else {
                            response.data = {message: "That's not the url of a Kong node."};
                            deferred.reject(response);
                        }
                    }, function (response) {
                        if (response.status == 511) {
                            response.data = {message: 'Kong API requires authentication.'};
                        } else if (response.status == 404) {
                            response.data = {message: "Can't connect to Kong server."};
                        }
                        deferred.reject(response);
                    });
                } catch (err) {
                    deferred.reject(err);
                }
                return deferred.promise;
            },

            setConfig: function (config) {
                var deferred = $q.defer();
                factory.checkConfig(config).then(function () {
                    factory.config = config;
                    $cookies.putObject('config.url', factory.config.url, {
                        expires: new Date(new Date().getTime() + 1000 * 24 * 3600 * 60) // remember 60 days
                    });
                    deferred.resolve();
                }, function (response) {
                    factory.handleError(response, deferred);
                });
                $cookies.putObject('config.gelato', config.gelato, {
                    expires: new Date(new Date().getTime() + 1000 * 24 * 3600 * 60) // remember 60 days
                });
                return deferred.promise;
            }
        };

        ['get', 'delete', 'head'].forEach(function (method) {
            factory[method] = function (endpoint) {
                var deferred = $q.defer();
                try {
                    Request({
                        kong_url: factory.config.url,
                        endpoint: endpoint,
                        method: method
                    }).then(function (response) {
                        deferred.resolve(response.data);
                    }, function (response) {
                        factory.handleError(response, deferred, endpoint);
                    });
                } catch(err) {
                    factory.handleError(err, deferred, endpoint);
                }
                return deferred.promise;
            };
        });

        ['post', 'put', 'patch'].forEach(function (method) {
            factory[method] = function (endpoint, data) {
                var deferred = $q.defer();
                try {
                    Request({
                        kong_url: factory.config.url,
                        endpoint: endpoint,
                        method: method,
                        data: data,
                    }).then(function (response) {
                        deferred.resolve(response.data);
                    }, function (response) {
                        factory.handleError(response, deferred, endpoint);
                    });
                } catch(err) {
                    factory.handleError(err, deferred, endpoint);
                }
                return deferred.promise;
            };
        });

        return factory;
    }]);
