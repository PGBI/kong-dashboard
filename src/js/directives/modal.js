angular.module('app').directive("modal", function () {
  return {
    restrict: 'C',
    link: function (scope, element, attrs) {
      // initialize materialize modal
      element.modal();
    }
  };
});
