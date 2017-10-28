(function() {

  angular.module('app')
    .controller('SelectPropertyController', SelectPropertyController);

  function SelectPropertyController()
  {
    var vm = this;

    vm.$onInit = function() {
      if (Array.isArray(vm.schema.enum)) {
        vm.options = {};
        vm.schema.enum.forEach(function(option) {
          vm.options[option] = option;
        });
      } else {
        vm.options = vm.schema.enum;
      }
    };
  }

})();
