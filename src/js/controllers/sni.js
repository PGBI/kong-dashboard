angular.module('app').controller("SniController", ["$scope", "Kong", "$location", "$routeParams", "Alert", "$route", function ($scope, Kong, $location, $routeParams, Alert, $route) {

    $scope.sni = {};
    $scope.certificates = [];

    onInit();
    
    function onInit() {
        Kong.get('/certificates').then(function(collection) {
            $scope.certificates = collection.data;
        });

        if ($routeParams.name) {
            Kong.get('/snis/' + $routeParams.name).then( function(data) {
                $scope.sni = data;
            });
            $scope.title = "Edit SNI";
            $scope.action = "Save";
            $scope.location = $location;
        } else {
            $scope.title = "Add a SNI";
            $scope.action = "Create";
        }
        
        if ($routeParams.certificate_id) {
            $scope.sni.ssl_certificate_id = $routeParams.certificate_id;
        }
    }

    $scope.isEdit = function () {
        return $routeParams.name != null;
    }

    $scope.save = function () {
        if ( $scope.isEdit() ) {
            Kong.patch('/snis/' + $scope.sni.name, $scope.sni).then(function () {
                Alert.success('SNI updated');
                $scope.error = {};
            }, function (response) {
                $scope.error = response.data;
            });    
        } else {
            Kong.post('/snis', $scope.sni).then(function () {
                Alert.success('SNI created');
                // clearing inputs.
                $scope.sni = {};
            
                // clearing errors.
                $scope.error = {};
            }, function (response) {
                $scope.error = response.data;
            });
        }
    };

}]);
