(function() {

  angular.module('app').component('checkboxProperty', {
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
    templateUrl: 'components/object_properties/object_property/checkbox_property/template.html',
    controller: 'CheckboxPropertyController'
  });

})();
