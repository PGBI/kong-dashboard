(function() {

  angular.module('app').component('multiSelectProperty', {
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
    templateUrl: 'components/object_properties/object_property/multi_select/template.html',
    controller: 'MultiSelectPropertyController'
  });

})();
