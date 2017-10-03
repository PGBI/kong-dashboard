angular.module('app').controller("CertificateController", ["$scope", "Kong", "$location", "$routeParams", "Alert", "$route", function ($scope, Kong, $location, $routeParams, Alert, $route) {

    $scope.certificate = {};

    onInit();
    
    function onInit() {
        if ($routeParams.id) {
            Kong.get('/certificates/' + $routeParams.id).then( function(data) {
                $scope.certificate = data;
            });
            $scope.title = "Edit Certificate";
            $scope.action = "Save";
            $scope.location = $location;
        } else {
            $scope.title = "Add a Certificate";
            $scope.action = "Create";
        }
    }

    $scope.isEdit = function () {
        return $routeParams.id != null;
    }

    $scope.save = function () {
        if ( $scope.isEdit() ) {
            Kong.patch('/certificates/' + $scope.certificate.id, $scope.certificate).then(function () {
                Alert.success('Certificate updated');
                $scope.error = {};
            }, function (response) {
                $scope.error = response.data;
            });    
        } else {
            Kong.post('/certificates', $scope.certificate).then(function () {
                Alert.success('Certificate created');
                // clearing inputs.
                $scope.certificate = {};
            
                // clearing errors.
                $scope.error = {};
            }, function (response) {
                $scope.error = response.data;
            });
        }
    };
}]);
