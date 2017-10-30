(function() {

  angular.module('app').component('inputProperty', {
    restrict: 'E',
    scope: {},
    bindings: {
      schema: '<',
      key: '<',
      path: '<',
      type: '<',
      error: '<',
      label: '<',
      object: '='
    },
    templateUrl: 'components/object_properties/object_property/input_property/template.html',
    controller: 'InputPropertyController'
  });

})();
