angular.module('app').controller("ApiController", ["$scope", "Kong", "$location", "$routeParams", "Alert", "api", function ($scope, Kong, $location, $routeParams, Alert, api) {
    if ($routeParams.id) {
        $scope.api = api;
        $scope.title = "Edit API";
        $scope.action = "Save";
    } else {
        $scope.title = "Add an API";
        $scope.action = "Create";
    }

    $scope.save = function () {
        Kong.put('/apis', $scope.api).then(function () {
            if ($routeParams.id) {
                Alert.success('Api updated');
            } else {
                Alert.success('Api created');
                // clearing inputs.
                $scope.api = {};
            }
            // clearing errors.
            $scope.error = {};
        }, function (response) {
            $scope.error = response.data;
        });
    }
}]);
