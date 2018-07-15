angular.module('app').directive("appSlideOut", function () {
    return {
        restrict: 'C',
        link: function(scope, element, attrs) {
            $(element).sideNav();
        }
    };
});
