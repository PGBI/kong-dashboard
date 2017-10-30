angular.module('app').controller("ApiController", ["$scope", "Kong", "$routeParams", "Alert", "api", "env", function ($scope, Kong, $routeParams, Alert, api, env)
{
    $scope.schema = env.schemas.api;
    $scope.errors = {};

    if ($routeParams.id) {
        $scope.api = api;
        $scope.title = "Edit API";
        $scope.action = "Save";
    } else {
        $scope.api = {};
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
            $scope.errors = {};
        }, function (response) {
            if (response.status == 400 || response.status == 409) {
                $scope.errors = response.data;
            } else {
                Alert.error('Unexpected error from Kong');
                console.log(response);
            }
        });
    }
}]);
