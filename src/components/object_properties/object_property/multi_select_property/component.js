(function() {

  angular.module('app').component('multiSelectProperty', {
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
    templateUrl: 'components/object_properties/object_property/multi_select_property/template.html',
    controller: 'MultiSelectPropertyController'
  });

})();
