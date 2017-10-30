(function() {

  angular.module('app').component('objectProperties', {
    restrict: 'E',
    scope: {},
    bindings: {
      schema: '<',
      object: '=',
      errors: '<',
      path: '<'
    },
    templateUrl: 'components/object_properties/template.html',
    controller: 'ObjectPropertiesController'
  });

})();
