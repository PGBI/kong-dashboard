angular.module('app').controller("UpstreamController", ["$scope", "Kong", "$location", "$routeParams", "Alert", "$route", function ($scope, Kong, $location, $routeParams, Alert, $route) {

    $scope.upstream = {};

    onInit();
    
    function onInit() {
        if ($routeParams.id) {
            Kong.get('/upstreams/' + $routeParams.id).then( function(data) {
                $scope.upstream = data;
            });
            $scope.title = "Edit Upstream";
            $scope.action = "Save";
            $scope.location = $location;
        } else {
            $scope.title = "Add a Upstream";
            $scope.action = "Create";
        }
    }

    $scope.isEdit = function () {
        return $routeParams.id != null;
    }

    $scope.save = function () {
        if ( $scope.isEdit() ) {
            //seting orderlist to a empty list will generate new orderlist.
            //This is needed if we update the number of slots
            //Also orderlist will be removed in Kong 0.12. See https://github.com/Mashape/kong/issues/2933#issuecomment-334520555
            $scope.upstream.orderlist = [];
            Kong.put('/upstreams', $scope.upstream).then(function () {
                Alert.success('Upstream updated');
                $scope.error = {};
            }, function (response) {
                $scope.error = response.data;
            });    
        } else {
            Kong.post('/upstreams', $scope.upstream).then(function () {
                Alert.success('Upstream created');
                // clearing inputs.
                $scope.upstream = {};
            
                // clearing errors.
                $scope.error = {};
            }, function (response) {
                $scope.error = response.data;
            });
        }
    };
}]);
