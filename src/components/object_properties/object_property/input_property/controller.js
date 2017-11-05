(function() {

  angular.module('app')
    .controller('InputPropertyController', ['$scope', InputPropertyController]);

  function InputPropertyController($scope)
  {

    var vm = this;
    vm.$onInit = function() {
      $scope.$watch("$ctrl.object[$ctrl.key]", function(newValue, oldValue) {
        if (angular.equals(newValue, {})) {
          vm.object[vm.key] = [];
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
