(function() {

  angular.module('app').component('selectProperty', {
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
    templateUrl: 'components/object_properties/object_property/select_property/template.html',
    controller: 'SelectPropertyController'
  });

})();
