(function() {

  angular.module('app')
    .controller('InlineArrayPropertyController', ['$scope', InlineArrayPropertyController]);

  function InlineArrayPropertyController($scope)
  {
    var vm = this;

    vm.$onInit = function() {
      $scope.$watch("$ctrl.object[$ctrl.key]", function(newValue, oldValue) {
        if (angular.equals(newValue, {}) || !newValue) {
          vm.object[vm.key] = [];
        } else if (typeof newValue == 'string') {
          vm.object[vm.key] = newValue.split(',').map(function(elt) {
            if (vm.schema.items.type == 'number') {
              return parseInt(elt);
            }
            return elt;
          });
        }
      });

      if (angular.equals(vm.schema.default, {})) {
        delete vm.schema.default;
      }
      if (angular.equals(vm.object[vm.key], {})) {
        vm.object[vm.key] = [];
      }
    };
  }

})();
