(function() {

  angular.module('app').component('attributeInput', {
    restrict: 'E',
    scope: {},
    bindings: {
      schema: '<',
      name: '<',
      type: '<'
    },
    templateUrl: 'components/resource_attribute/attribute_input/template.html',
    controller: 'AttributeInputController'
  });

})();
