(function() {

  angular.module('app').component('multiSelect', {
    restrict: 'E',
    scope: {},
    bindings: {
      schema: '<',
      name: '<',
    },
    templateUrl: 'components/resource_attribute/multi_select/template.html',
    controller: 'MultiSelectController'
  });

})();
