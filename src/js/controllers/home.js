angular.module('app').controller("HomeController", ["$scope", "$http", function ($scope, $http) {

    $http({
        method: 'GET',
        url: 'https://api.github.com/repos/pgbi/kong-dashboard/contributors'
    }).then(function (response) {
        $scope.contributors = response.data.slice(0,5);
    });

}]);
