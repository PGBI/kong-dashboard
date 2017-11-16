(function() {

  angular.module('app')
    .controller('ObjectPropertiesController', ['Alert', ObjectPropertiesController]);

  function ObjectPropertiesController(Alert)
  {
    var vm = this;

    vm.newPropertyKeyPress = function($event) {
      if ($event.keyCode !== 13 || !vm.newPropertyName) {
        return;
      }

      $event.preventDefault();
      $event.stopPropagation();

      vm.newPropertyName = vm.newPropertyName.trim();
      if (vm.newPropertyName.length == 0) {
        return;
      }

      if (vm.object.hasOwnProperty(vm.newPropertyName)) {
        Alert.error('There is already a property named ' + vm.newPropertyName);
        return;
      }

      vm.object[vm.newPropertyName] = vm.schema.additionalProperties.type == 'object' ? {} : '';
      vm.newPropertyName = '';
    };
  }

})();
