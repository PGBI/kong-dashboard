var app = angular.module('app', ['ngRoute', 'ngCookies', 'ngAnimate', 'ngSanitize', 'infinite-scroll'])
  .config(['$routeProvider', function ($routeProvider) {

    var appStarted = false;

    var isAppReady = ['Kong', '$location', function(Kong, $location) {
      if (appStarted) {
        return true;
      }
      if (!Kong.config.url) {
        $location.path('/config');
        return false;
      }
    }];

    $routeProvider
      .when('/', {
        templateUrl: 'html/home.html',
        controller: 'HomeController',
        resolve: {
          isAppReady: isAppReady
        }
      })
      .when('/config', {
        templateUrl: 'html/config.html',
        controller: 'ConfigController'
      })
      .when('/apis', {
        templateUrl: 'html/apis/index.html',
        controller: 'ApisController',
        resolve: {
          isAppReady: isAppReady
        }
      })
      .when('/apis/add', {
        templateUrl: 'html/apis/form.html',
        controller: 'ApiController',
        resolve: {
          isAppReady: isAppReady,
          api: function() {return {}}
        }
      })
      .when('/apis/:id', {
        templateUrl: 'html/apis/form.html',
        controller: 'ApiController',
        resolve: {
          isAppReady: isAppReady,
          api: ['Kong', '$route', function (Kong, $route) {
            var id = $route.current.params.id;
            return Kong.get('/apis/' + id)
          }]
        }
      })
      .when('/apis/:api_id/plugins', {
        templateUrl: 'html/plugins/index.html',
        controller: 'PluginsController',
        resolve: {
          isAppReady: isAppReady,
          owner: ['Kong', '$route', function(Kong, $route) {
            var api_id = $route.current.params.api_id;
            return Kong.get('/apis/' + api_id);
          }]
        }
      })
      .when('/consumers/:consumer_id/plugins', {
        templateUrl: 'html/plugins/index.html',
        controller: 'PluginsController',
        resolve: {
          isAppReady: isAppReady,
          owner: ['Kong', '$route', function(Kong, $route) {
            var consumer_id = $route.current.params.consumer_id;
            return Kong.get('/consumers/' + consumer_id);
          }]
        }
      })
      .when('/plugins', {
        templateUrl: 'html/plugins/index.html',
        controller: 'PluginsController',
        resolve: {
          isAppReady: isAppReady,
          owner: function() { return {};}
        }
      })
      .when('/plugins/add', {
        templateUrl: 'html/plugins/form.html',
        controller: 'PluginController',
        resolve: {
          isAppReady: isAppReady,
          plugin: function() {
            return null;
          },
          plugins: ['Kong', function (Kong) {
            return Kong.get('/plugins/enabled');
          }],
          apis: ['Kong', '$location', function(Kong) {
            return Kong.get('/apis');
          }],
          consumers: ['Kong', '$location', function(Kong) {
            return Kong.get('/consumers?size=1000');
          }]
        }
      })
      .when('/plugins/:id', {
        templateUrl: 'html/plugins/form.html',
        controller: 'PluginController',
        resolve: {
          isAppReady: isAppReady,
          plugin: ['Kong', '$route', function (Kong, $route) {
            var id = $route.current.params.id;
            return Kong.get('/plugins/' + id);
          }],
          plugins: ['Kong', function (Kong) {
            return Kong.get('/plugins/enabled');
          }],
          apis: ['Kong', '$location', function(Kong) {
            return Kong.get('/apis');
          }],
          consumers: ['Kong', '$location', function(Kong) {
            return Kong.get('/consumers');
          }]
        }
      })
      .when('/consumers', {
        templateUrl: 'html/consumers/index.html',
        controller: 'ConsumersController',
        resolve: {
          isAppReady: isAppReady
        }
      })
      .when('/consumers/add', {
        templateUrl: 'html/consumers/form.html',
        controller: 'ConsumerController',
        resolve: {
          isAppReady: isAppReady,
          consumer: function() { return {}; },
        }
      })
      .when('/consumers/:id', {
        templateUrl: 'html/consumers/form.html',
        controller: 'ConsumerController',
        resolve: {
          isAppReady: isAppReady,
          consumer: ['Kong', '$route', function (Kong, $route) {
            var id = $route.current.params.id;
            return Kong.get('/consumers/' + id)
          }]
        }
      })
      .when('/snis', {
        templateUrl: 'html/snis/index.html',
        controller: 'SnisController',
        resolve: {
          isAppReady: isAppReady
        }
      })
      .when('/snis/add', {
        templateUrl: 'html/snis/form.html',
        controller: 'SniController',
        resolve: {
          isAppReady: isAppReady
        }
      })
      .when('/snis/:name', {
        templateUrl: 'html/snis/form.html',
        controller: 'SniController',
        resolve: {
          isAppReady: isAppReady,
        }
      })
      .when('/snis/add/:certificate_id', {
        templateUrl: 'html/snis/form.html',
        controller: 'SniController',
        resolve: {
          isAppReady: isAppReady
        }
      })
      .when('/certificates', {
        templateUrl: 'html/certificates/index.html',
        controller: 'CertificatesController',
        resolve: {
          isAppReady: isAppReady
        }
      })
      .when('/certificates/add', {
        templateUrl: 'html/certificates/form.html',
        controller: 'CertificateController',
        resolve: {
          isAppReady: isAppReady
        }
      })
      .when('/certificates/:id', {
        templateUrl: 'html/certificates/form.html',
        controller: 'CertificateController',
        resolve: {
          isAppReady: isAppReady,
        }
      })
      .otherwise({redirectTo: '/'});
  }])
  .run(['$rootScope', 'Kong', '$location', function($rootScope, Kong, $location) {
    $rootScope.initialized = false;
    Kong.checkConfig(Kong.config).then(function() {
      $rootScope.app = Kong;
      $rootScope.initialized = true;
    }, function() {
      Kong.config.url = null;
      $rootScope.app = Kong;
      $rootScope.initialized = true;
      $location.path("/config");
    });

    $rootScope.Utils = {
      keys : Object.keys
    };
  }]);
