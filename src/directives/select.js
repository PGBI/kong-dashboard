angular.module('app').directive("materializeSelect", ["$compile", "$timeout", function ($compile, $timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            function initSelect() {
                element.material_select();
            }
            $timeout(initSelect);
            if (attrs.ngModel && !attrs.multiple) {
                scope.$watch(attrs.ngModel, initSelect);
            }
        }
    };
}]);
