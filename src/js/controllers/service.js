angular.module('app').controller("ServiceController", ["$scope", "Kong", "$routeParams", "Alert", "service", "env", function ($scope, Kong, $routeParams, Alert, service, env)
{
    $scope.schema = env.schemas.service;
    $scope.errors = {};

    if ($routeParams.id) {
        $scope.service = service;
        $scope.title = "Edit Service";
        $scope.action = "Save";
    } else {
        $scope.service = {};
        $scope.title = "Add an Service";
        $scope.action = "Create";
    }

    $scope.isEdit = function () {
        return $routeParams.id != null;
    }

    $scope.save = function () {
        if ( $scope.isEdit() ) {
            Kong.patch('/services/' + $scope.service.id, $scope.service).then(function () {
                Alert.success('Service updated');
                // clearing errors.
                $scope.errors = {};
            }, function (response) {
                if (response.status == 400 || response.status == 409) {
                    $scope.errors = response.data.fields;
                } else {
                    Alert.error('Unexpected error from Kong');
                    console.log(response);
                }
            });
        } else {
            Kong.post('/services', $scope.service).then(function () {
                Alert.success('Service created');
                // clearing errors.
                $scope.errors = {};
            }, function (response) {
                if (response.status == 400 || response.status == 409) {
                    $scope.errors = response.data.fields;
                } else {
                    Alert.error('Unexpected error from Kong');
                    console.log(response);
                }
            });
        }
    }
}]);