angular.module('app').directive("appRouteLoadingIndicator", ['$rootScope', function ($rootScope) {
    return {
        restrict: 'E',
        templateUrl: "html/directives_templates/route_loading_indicator.html",
        controller: ['$scope', '$rootScope', 'Alert', function ($scope, $rootScope, Alert) {
            $scope.loading = false;
            $rootScope.$on('$routeChangeStart', function () {
                $scope.loading = true;
            });
            $rootScope.$on('$routeChangeSuccess', function () {
                $scope.loading = false;
            });
            $rootScope.$on('$routeChangeError', function() {
                $scope.loading = false;
            });
        }]
    };
}]);
