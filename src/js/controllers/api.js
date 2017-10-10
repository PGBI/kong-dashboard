angular.module('app').controller("ApiController", ["$scope", "Kong", "$location", "$routeParams", "Alert", "api", "env", function ($scope, Kong, $location, $routeParams, Alert, api, env) {
    $scope.apiObjectSchema = env.schemas.api;

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
            if (response.status == 400) {
                $scope.error = response.data;
            } else {
                Alert.error('Unexpected error from Kong');
                console.log(response);
            }
        });
    }
}]);
