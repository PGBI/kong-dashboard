angular.module('app').directive("materializeTabs", function () {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).tabs();
        }
    };
});
