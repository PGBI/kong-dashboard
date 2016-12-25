angular.module('app').controller("ConfigController", ["$scope", "Kong", "Alert", "$location", function ($scope, Kong, Alert, $location) {
    $scope.config = angular.copy(Kong.config);

    var first_setup = !$scope.config.url;

    $scope.update = function() {
        if (!$scope.config.url) {
            Alert.error("You need to indicate the url and port of the Kong node you want to manage.");
            return;
        }

        Kong.setConfig($scope.config).then(function() {
            if (first_setup) {
                $location.path('/');
                first_setup = false;
            } else {
                // celebrate
                Alert.success('Saved!');
            }
        });
    }
}]);
