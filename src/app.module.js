'use strict';
(function() {
  angular.module('app', ['ngRoute', 'ngAnimate', 'ngSanitize', 'infinite-scroll'])
    .constant('env', window.__env)
    .run(['$rootScope', 'env', run]);

  function run($rootScope, env) {
    $rootScope.Utils = {
      keys : Object.keys
    };

    $rootScope.env = env;
  }
})();
