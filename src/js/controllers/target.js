angular.module('app').controller("TargetController", ["$scope", "Kong", "$location", "$routeParams", "Alert", "$route", function ($scope, Kong, $location, $routeParams, Alert, $route) {

    $scope.target = {};
    $scope.upstream = {};

    onInit();
    
    function onInit() {
        console.log('upstream_id = ' + $routeParams.upstream_id);
        Kong.get('/upstreams/' + $routeParams.upstream_id).then( function(data) {
            $scope.upstream = data;
        });

        $scope.target.upstream_id = $routeParams.upstream_id;

        if ($routeParams.id) {
            Kong.get('/upstreams/' + $routeParams.upstream_id + '/targets/' + $routeParams.id).then( function(data) {
                $scope.target = data;
            });
            $scope.title = "Edit Target";
            $scope.action = "Save";
            $scope.location = $location;
        } else {
            $scope.title = "Add a Target";
            $scope.action = "Create";
        }
    }

    $scope.isEdit = function () {
        return $routeParams.id != null;
    }

    $scope.save = function () {
        if ( $scope.isEdit() ) {
            Kong.put('/upstreams/' + $scope.upstream.id + '/targets', $scope.target).then(function () {
                Alert.success('Target updated');
                $scope.error = {};
            }, function (response) {
                $scope.error = response.data;
            });    
        } else {
            Kong.post('/upstreams/' + $scope.upstream.id + '/targets', $scope.target).then(function () {
                Alert.success('Target created');
                // clearing inputs.
                $scope.target = {};
                $scope.target.upstream_id = $scope.upstream.id;
            
                // clearing errors.
                $scope.error = {};
            }, function (response) {
                $scope.error = response.data;
            });
        }
    };
}]);
