(function() {

  angular.module('app')
    .controller('CheckboxPropertyController', CheckboxPropertyController);

  function CheckboxPropertyController()
  {
    var vm = this;

    vm.$onInit = function() {
      if (typeof vm.object[vm.key] == 'undefined') {
        vm.object[vm.key] = vm.schema.default;
      }
    };
  }

})();
