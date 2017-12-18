(function() {
  angular.module('app').config(['$routeProvider', router]);

  function router($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'html/home.html',
        controller: 'HomeController'
      })
      .when('/apis', {
        templateUrl: 'html/apis/index.html',
        controller: 'ApisController'
      })
      .when('/apis/add', {
        templateUrl: 'html/apis/form.html',
        controller: 'ApiController',
        resolve: {
          api: function() {return {}}
        }
      })
      .when('/apis/:id', {
        templateUrl: 'html/apis/form.html',
        controller: 'ApiController',
        resolve: {
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
          owner: function() { return {};}
        }
      })
      .when('/plugins/add', {
        templateUrl: 'html/plugins/form.html',
        controller: 'PluginController',
        resolve: {
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
        controller: 'ConsumersController'
      })
      .when('/consumers/add', {
        templateUrl: 'html/consumers/form.html',
        controller: 'ConsumerController',
        resolve: {
          consumer: function() { return {}; }
        }
      })
      .when('/consumers/:id', {
        templateUrl: 'html/consumers/form.html',
        controller: 'ConsumerController',
        resolve: {
          consumer: ['Kong', '$route', function (Kong, $route) {
            var id = $route.current.params.id;
            return Kong.get('/consumers/' + id)
          }]
        }
      })
      .when('/snis', {
        templateUrl: 'html/snis/index.html',
        controller: 'SnisController'
      })
      .when('/snis/add', {
        templateUrl: 'html/snis/form.html',
        controller: 'SniController'
      })
      .when('/snis/:name', {
        templateUrl: 'html/snis/form.html',
        controller: 'SniController'
      })
      .when('/snis/add/:certificate_id', {
        templateUrl: 'html/snis/form.html',
        controller: 'SniController'
      })
      .when('/certificates', {
        templateUrl: 'html/certificates/index.html',
        controller: 'CertificatesController'
      })
      .when('/certificates/add', {
        templateUrl: 'html/certificates/form.html',
        controller: 'CertificateController'
      })
      .when('/certificates/:id', {
        templateUrl: 'html/certificates/form.html',
        controller: 'CertificateController'
      })
      .when('/upstreams', {
        templateUrl: 'html/upstreams/index.html',
        controller: 'UpstreamsController',
      })
      .when('/upstreams/add', {
        templateUrl: 'html/upstreams/form.html',
        controller: 'UpstreamController',
      })
      .when('/upstreams/:id', {
        templateUrl: 'html/upstreams/form.html',
        controller: 'UpstreamController',
      })
      .when('/upstreams/:upstream_id/targets', {
        templateUrl: 'html/targets/index.html',
        controller: 'TargetsController',
        resolve: {
          upstream: ['Kong', '$route', function (Kong, $route) {
            var id = $route.current.params.upstream_id;
            return Kong.get('/upstreams/' + id);
          }]
        }
      })
      .when('/upstreams/:upstream_id/targets/add', {
        templateUrl: 'html/targets/form.html',
        controller: 'TargetController',
      })
      .otherwise({redirectTo: '/'});
  }
})()
