(function() {

  angular.module('app').component('multiSelect', {
    restrict: 'E',
    scope: {},
    bindings: {
      schema: '<',
      name: '<',
      value: '='
    },
    templateUrl: 'components/resource_attribute/multi_select/template.html',
    controller: 'MultiSelectController'
  });

})();
