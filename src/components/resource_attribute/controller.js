(function() {

  angular.module('app')
    .controller('ResourceAttributeController', ResourceAttributeController);

  function ResourceAttributeController()
  {
    this.$onInit = function() {
      if (typeof this.value === 'undefined' && typeof this.schema.default !== 'undefined') {
        this.value = this.schema.default;
      }
    };
  }

})();
