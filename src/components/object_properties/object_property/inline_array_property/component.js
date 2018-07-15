(function() {

  angular.module('app').component('inlineArrayProperty', {
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
    templateUrl: 'components/object_properties/object_property/inline_array_property/template.html',
    controller: 'InlineArrayPropertyController'
  });

})();
