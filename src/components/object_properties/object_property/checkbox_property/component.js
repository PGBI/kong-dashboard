(function() {

  angular.module('app').component('checkboxProperty', {
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
    templateUrl: 'components/object_properties/object_property/checkbox_property/template.html',
    controller: 'CheckboxPropertyController'
  });

})();
