(function() {

  angular.module('app').component('checkbox', {
    restrict: 'E',
    scope: {},
    bindings: {
      schema: '<',
      name: '<',
    },
    templateUrl: 'components/resource_attribute/attribute_checkbox/template.html',
    controller: 'AttributeCheckboxController'
  });

})();
