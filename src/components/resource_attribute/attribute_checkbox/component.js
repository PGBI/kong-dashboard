(function() {

  angular.module('app').component('checkbox', {
    restrict: 'E',
    scope: {},
    bindings: {
      schema: '<',
      name: '<',
      value: '='
    },
    templateUrl: 'components/resource_attribute/attribute_checkbox/template.html',
    controller: 'AttributeCheckboxController'
  });

})();
