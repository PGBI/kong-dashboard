(function() {

  angular.module('app')
    .controller('ObjectPropertyController', ObjectPropertyController);

  function ObjectPropertyController()
  {
    var vm = this;

    vm.$onChanges = function(object) {
      if (object.errors) {
        vm.error = vm.errors[vm.key] || '';
      }
    };

    vm.$onInit = function() {
      vm.label = vm.propertySchema.label || vm.key;
      vm.value = vm.object[vm.key];
    };

    vm.deleteProperty = function() {
      delete vm.object[vm.key];
    }
  }

})();
