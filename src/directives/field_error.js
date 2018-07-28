angular.module('app').directive("appFieldError", function () {
    return {
        restrict: 'E',
        scope: {
            error: '='
        },
        templateUrl: 'directives/field_error.html'
    };
});
