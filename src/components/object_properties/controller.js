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

    /*
    vm.$onInit = function() {

      if (typeof vm.object[vm.key] === 'undefined' && typeof vm.schema.default !== 'undefined') {
        vm.object[vm.key] = vm.schema.default;
      }

      vm.label = vm.schema.label || vm.key;
    };

    vm.deleteProperty = function(key) {
      delete vm.object[key];
    }*/
  }

})();
