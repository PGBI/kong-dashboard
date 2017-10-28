(function() {

  angular.module('app').component('inputProperty', {
    restrict: 'E',
    scope: {},
    bindings: {
      schema: '<',
      key: '<',
      type: '<',
      error: '<',
      label: '<',
      object: '='
    },
    templateUrl: 'components/object_properties/object_property/input_property/template.html',
    controller: 'InputPropertyController'
  });

})();
