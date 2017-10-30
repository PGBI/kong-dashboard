(function() {

  angular.module('app').component('objectProperty', {
    restrict: 'E',
    scope: {},
    bindings: {
      key: '<',
      propertySchema: '<',
      object: '=',
      errors: '<',
      removable: '<',
      path: '<'
    },
    templateUrl: 'components/object_properties/object_property/template.html',
    controller: 'ObjectPropertyController'
  });

})();
