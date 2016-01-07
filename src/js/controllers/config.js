angular.module('app').controller("ConfigController", ["$scope", "Kong", "Alert", "$location", function ($scope, Kong, Alert, $location) {
    $scope.config = angular.copy(Kong.config);

    var first_setup = !$scope.config.url;

    $scope.update = function() {
        if (!$scope.config.url) {
            Alert.error("You need to indicate the url and port of the Kong node you want to manage.");
            return;
        }

        if ($scope.config.auth.type === 'basic_auth') {
            var parser = document.createElement('a');
            parser.href = $scope.config.url;
            if (parser.protocol === 'http:') {
                var message = "WARNING - You are about to use basic auth over http requests, which is not recommended: " +
                    "password will be sent over the network in plaintext.\n\nAre you sure you want to proceed?";
                if (!confirm(message)) {
                    return;
                }
            }
        }

        Kong.setConfig($scope.config).then(function() {
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
            } else if (reason == 'Auth required') {
                Alert.error("Authentication required");
            } else if (reason == 'Forbidden') {
                Alert.error("Authentication failure");
            } else {
                Alert.error("Can't access a kong node with this url/port.");
            }
        });
    }
}]);
