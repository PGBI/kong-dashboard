angular.module('app').controller("ConfigController", ["$scope", "Kong", "Alert", "$location", function ($scope, Kong, Alert, $location) {
    $scope.config = angular.copy(Kong.config);

    var first_setup = !$scope.config.url || !$scope.config.port;

    $scope.update = function() {
        if (!$scope.config.url || !$scope.config.port) {
            Alert.error("You need to indicate the url and port of the Kong node you want to manage.");
            return;
        }
        Kong.setConfig($scope.config.url, $scope.config.port).then(function() {
            if (first_setup) {
                $location.path('/');
                first_setup = false;
            } else {
                // celebrate
                Alert.success('Saved!');
            }
        }, function(reason) {
            if (reason == 'Not Kong') {
                Alert.error("That's not a kong node.");
            } else {
                Alert.error("Can't access a kong node with this url/port.");
            }
        });
    }
}]);
