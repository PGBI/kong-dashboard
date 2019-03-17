(function() {
  angular.module('app').config(['$routeProvider', router]);

  function router($routeProvider) {

    var indexRoutes = [
      { path: '/apis', resourceType: 'API' },
      { path: '/apis/:id/plugins', resourceType: 'plugin', parentType: 'API' },
      { path: '/certificates', resourceType: 'certificate' },
      { path: '/consumers', resourceType: 'consumer' },
      { path: '/consumers/:id/groups', resourceType: 'acl', parentType: 'consumer' },
      { path: '/consumers/:id/plugins', resourceType: 'plugin', parentType: 'consumer' },
      { path: '/consumers/:id/basic-auth-credentials', resourceType: 'basic-auth-credential', resourceName: 'basic auth credential', parentType: 'consumer' },
      { path: '/consumers/:id/hmac-credentials', resourceType: 'hmac-credential', resourceName: 'hmac credential', parentType: 'consumer' },
      { path: '/consumers/:id/jwt-credentials', resourceType: 'jwt-credential', resourceName: 'jwt credential', parentType: 'consumer' },
      { path: '/consumers/:id/auth-keys', resourceType: 'auth-key', parentType: 'consumer' },
      { path: '/consumers/:id/oauth2-credentials', resourceType: 'oauth2-credential', resourceName: 'oauth2 credential', parentType: 'consumer' },
      { path: '/plugins',  resourceType: 'plugin' },
      { path: '/routes', resourceType: 'route' },
      { path: '/services', resourceType: 'service' },
      { path: '/services/:id/routes', resourceType: 'route', parentType: 'service' },
      { path: '/upstreams', resourceType: 'upstream' },
      { path: '/upstreams/:id/targets', resourceType: 'target', parentType: 'upstream' },
    ];

    var createUpdateRoutes = [
      { path: '/apis/add', resourceType: 'API'},
      { path: '/apis/:id', resourceType: 'API'},
      { path: '/certificates/add', resourceType: 'certificate'},
      { path: '/certificates/:id', resourceType: 'certificate'},
      { path: '/consumers/add', resourceType: 'consumer'},
      { path: '/consumers/:id', resourceType: 'consumer'},
      { path: '/consumers/:parent_id/auth-keys/add', resourceType: 'auth-key', parentType: 'consumer'},
      { path: '/consumers/:parent_id/basic-auth-credential/add', resourceType: 'basic-auth-credential', resourceName: 'basic auth credential', parentType: 'consumer'},
      { path: '/consumers/:parent_id/groups/add', resourceType: 'acl', parentType: 'consumer'},
      { path: '/consumers/:parent_id/jwt-credentials/add', resourceType: 'jwt-credential', resourceName: 'jwt credential', parentType: 'consumer' },
      { path: '/consumers/:parent_id/hmac-credentials/add', resourceType: 'hmac-credential', resourceName: 'hmac credential', parentType: 'consumer'},
      { path: '/consumers/:parent_id/oauth2-credentials/add', resourceType: 'oauth2-credential', resourceName: 'oauth2 credential', parentType: 'consumer' },
      { path: '/routes/:id', resourceType: 'route'},
      { path: '/services/add', resourceType: 'service'},
      { path: '/services/:id', resourceType: 'service'},
      { path: '/services/:parent_id/routes/add', resourceType: 'route', parentType: 'service'},
      { path: '/upstreams/add', resourceType: 'upstream'},
      { path: '/upstreams/:id', resourceType: 'upstream'},
      { path: '/upstreams/:parent_id/targets/add', resourceType: 'target', parentType: 'upstream'},
    ];

    indexRoutes.forEach(function (route) {
      $routeProvider.when(route.path, {
        templateUrl: 'pages/index_resources/base.view.html',
        controller: 'IndexResources',
        controllerAs: 'vm',
        resolve: {
          resourceType: function () {
            return route.resourceType
          },
          resourceName: function () {
            var name = route.resourceName || route.resourceType;
            return name.charAt(0).toUpperCase() + name.slice(1);
          },
          parentType: function () {
            return route.parentType || null;
          },
          parent: ['Kong', '$route', function (Kong, $route) {
            if (!route.parentType) {
              return null;
            }
            var parentId = $route.current.params.id;
            return Kong.get('/' + route.parentType.toLowerCase() + 's/' + parentId);
          }]
        }
      });
    });

    createUpdateRoutes.forEach(function (route) {
      $routeProvider.when(route.path, {
        templateUrl: 'pages/create_or_update_resource/show_resource.view.html',
        controller: 'CreateOrUpdateResource',
        controllerAs: 'vm',
        resolve: {
          resourceType: function () {
            return route.resourceType
          },
          resourceName: function () {
            var name = route.resourceName || route.resourceType;
            return name.charAt(0).toUpperCase() + name.slice(1);
          },
          resource: ['Kong', '$route', function (Kong, $route) {
            if (!$route.current.params.id) {
              return null;
            } else {
              return Kong.get('/' + route.resourceType.toLowerCase() + 's/' + $route.current.params.id);
            }
          }],
          parentType: function () {
            return route.parentType || null;
          },
          parent: ['Kong', '$route', function (Kong, $route) {
            if (!route.parentType) {
              return null;
            }
            var parentId = $route.current.params.parent_id;
            return Kong.get('/' + route.parentType.toLowerCase() + 's/' + parentId);
          }]
        }
      });
    });

    $routeProvider
      .when('/', {
        templateUrl: 'pages/home/home.html',
        controller: 'HomeController'
      })
      .when('/plugins/add', {
        templateUrl: 'pages/create_or_update_plugin/plugin.view.html',
        controller: 'PluginController',
        controllerAs: 'vm',
        resolve: {
          plugin: function() {
            return null;
          },
          plugins: ['Kong', function (Kong) {
            return Kong.get('/plugins/enabled');
          }],
          apis: ['Kong', 'env', function(Kong, env) {
            if (env.schemas.api) {
              return Kong.get('/apis?size=1000');
            } else {
              return null;
            }
          }],
          consumers: ['Kong', function(Kong) {
            return Kong.get('/consumers?size=1000');
          }],
          services: ['Kong', 'env', function(Kong, env) {
            if (env.schemas.service) {
              return Kong.get('/services?size=1000');
            } else {
              return null;
            }
          }],
          routes: ['Kong', 'env', function(Kong, env) {
            if (env.schemas.route) {
              return Kong.get('/routes?size=1000');
            } else {
              return null;
            }
          }]
        }
      })
      .when('/plugins/:id', {
        templateUrl: 'pages/create_or_update_plugin/plugin.view.html',
        controller: 'PluginController',
        controllerAs: 'vm',
        resolve: {
          plugin: ['Kong', '$route', function (Kong, $route) {
            var id = $route.current.params.id;
            return Kong.get('/plugins/' + id);
          }],
          plugins: ['Kong', function (Kong) {
            return Kong.get('/plugins/enabled');
          }],
          apis: ['Kong', 'env', function(Kong, env) {
            if (env.schemas.api) {
              return Kong.get('/apis?size=1000');
            } else {
              return null;
            }
          }],
          consumers: ['Kong', function(Kong) {
            return Kong.get('/consumers');
          }],
          services: ['Kong', 'env', function(Kong, env) {
            if (env.schemas.service) {
              return Kong.get('/services?size=1000');
            } else {
              return null;
            }
          }],
          routes: ['Kong', 'env', function(Kong, env) {
            if (env.schemas.route) {
              return Kong.get('/routes?size=1000');
            } else {
              return null;
            }
          }]
        }
      })
      .otherwise({redirectTo: '/'});
  }
})();
