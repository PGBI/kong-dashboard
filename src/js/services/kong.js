/**
 * This factory handles CRUD requests to the backend API.
 */
angular.module('app')
    .factory('Kong', ['$http', '$q', '$cookies', 'Alert', function ($http, $q, $cookies, Alert) {
        var config = $cookies.getObject('config');
        if (!config || !config.url || !config.port) {
            config = {url: null, port: null};
        }

        var factory = {
            config: config,
            get: function (endpoint) {
                var deferred = $q.defer();
                $http.get(factory.config.url + ':' + factory.config.port + endpoint).then(function (response) {
                    deferred.resolve(response.data);
                }, function (response) {
                    factory.handleError(response, deferred, endpoint);
                });
                return deferred.promise;
            },
            put: function (endpoint, data) {
                var deferred = $q.defer();
                $http.put(factory.config.url + ':' + factory.config.port + endpoint, data).then(function (response) {
                    deferred.resolve(response.data);
                }, function (response) {
                    factory.handleError(response, deferred, endpoint);
                });
                return deferred.promise;
            },
            patch: function (endpoint, data) {
                var deferred = $q.defer();
                $http.patch(factory.config.url + ':' + factory.config.port + endpoint, data).then(function (response) {
                    deferred.resolve(response.data);
                }, function (response) {
                    factory.handleError(response, deferred, endpoint);
                });
                return deferred.promise;
            },
            delete: function (endpoint) {
                var deferred = $q.defer();
                $http.delete(factory.config.url + ':' + factory.config.port + endpoint).then(function (response) {
                    deferred.resolve(response);
                }, function (response) {
                    factory.handleError(response, deferred, endpoint);
                });
                return deferred.promise;
            },
            post: function (endpoint, data) {
                var deferred = $q.defer();
                $http.post(factory.config.url + ':' + factory.config.port + endpoint, data).then(function (response) {
                    deferred.resolve(response.data);
                }, function (response) {
                    factory.handleError(response, deferred, endpoint);
                });
                return deferred.promise;
            },
            handleError: function (response, deferred, endpoint) {
                if (response.data && response.status != 500) {
                    if (response.data.message) {
                        Alert.error(response.data.message);
                    }
                    deferred.reject(response);
                } else {
                    console.log(endpoint);
                    console.log(response);
                    Alert.error("Oops, something wrong happened. Please refresh the page.");
                    response.data = {};
                    deferred.reject(response);
                }
            },
            checkConfig: function (url, port) {
                var deferred = $q.defer();
                if (!url || !port) {
                    deferred.reject('Not reachable');
                } else {
                    $http({
                        url: url + ':' + port,
                        method: 'GET',
                        timeout: 5000
                    }).then(function (response) {
                        if (response.data.tagline && response.data.tagline == "Welcome to Kong") {
                            deferred.resolve();
                        } else {
                            deferred.reject('Not Kong');
                        }
                    }, function () {
                        deferred.reject('Not reachable');
                    });
                }
                return deferred.promise;
            },
            setConfig: function (url, port) {
                var deferred = $q.defer();
                factory.checkConfig(url, port).then(function () {
                    factory.config.url = url;
                    factory.config.port = port;
                    $cookies.putObject('config', factory.config, {
                        expires: new Date(new Date().getTime() + 1000 * 24 * 3600 * 60) // remember 60 days
                    });
                    deferred.resolve();
                }, function (response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            }
        };
        return factory;
    }]);
