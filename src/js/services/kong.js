/**
 * This factory handles CRUD requests to the backend API.
 */
angular.module('app')
    .factory('Kong', ['$http', '$q', '$cookies', 'Request', 'Alert', function ($http, $q, $cookies, Request, Alert) {
        var config = {
            url : $cookies.getObject('config.url'),
            auth : { type : "no_auth" }
        };

        var factory = {
            config: config,
            get: function (endpoint) {
                var deferred = $q.defer();
                Request.get(factory.config.url + endpoint).then(function (response) {
                    deferred.resolve(response.data);
                }, function (response) {
                    factory.handleError(response, deferred, endpoint);
                });
                return deferred.promise;
            },
            put: function (endpoint, data) {
                var deferred = $q.defer();
                Request({
                    method: 'PUT',
                    url: factory.config.url + endpoint,
                    data: data,
                }).then(function (response) {
                    deferred.resolve(response.data);
                }, function (response) {
                    factory.handleError(response, deferred, endpoint);
                });
                return deferred.promise;
            },
            patch: function (endpoint, data) {
                var deferred = $q.defer();
                Request.patch(factory.config.url + endpoint, data).then(function (response) {
                    deferred.resolve(response.data);
                }, function (response) {
                    factory.handleError(response, deferred, endpoint);
                });
                return deferred.promise;
            },
            delete: function (endpoint) {
                var deferred = $q.defer();
                Request.delete(factory.config.url + endpoint).then(function (response) {
                    deferred.resolve(response);
                }, function (response) {
                    factory.handleError(response, deferred, endpoint);
                });
                return deferred.promise;
            },
            post: function (endpoint, data) {
                var deferred = $q.defer();
                Request.post(factory.config.url + endpoint, data).then(function (response) {
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
                    Alert.error("Oops, something wrong happened. Please refresh the page.");
                    response.data = {};
                    deferred.reject(response);
                }
            },
            checkConfig: function (config) {
                var url = config.url;
                if (config.auth.type === 'basic_auth') {
                    var auth_string = btoa(config.auth.username + ':' + config.auth.password);
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + auth_string;
                } else {
                    delete $http.defaults.headers.common['Authorization'];
                }
                var deferred = $q.defer();
                if (!url) {
                    deferred.reject('Not reachable');
                } else {
                    Request({
                        url: url,
                        method: 'GET',
                        timeout: 5000,
                    }).then(function (response) {
                        if (response.data.tagline && angular.isString(response.data.tagline) && response.data.tagline.toLowerCase() == "welcome to kong") {
                            deferred.resolve();
                        } else {
                            deferred.reject('Not Kong');
                        }
                    }, function (response) {
                        if (response.status == 401) {
                            deferred.reject('Auth required');
                        } else if (response.status == 403) {
                            deferred.reject('Forbidden');
                        } else {
                            deferred.reject('Not reachable');
                        }
                    });
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
                    deferred.reject(response);
                });
                return deferred.promise;
            }
        };
        return factory;
    }]);
