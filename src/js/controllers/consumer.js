angular.module('app').controller("ConsumerController", ["$scope", "Kong", "$location", "$routeParams", "consumer", "Alert", "$route", function ($scope, Kong, $location, $routeParams, consumer, Alert, $route) {
    if ($routeParams.id) {
        $scope.consumer = consumer;
        $scope.title = "Edit Consumer";
        $scope.action = "Save";
        $scope.location = $location;
        loadExtensions('jwt');
        loadExtensions('basic-auth');
        loadExtensions('oauth2');
        loadExtensions('key-auth');
        loadExtensions('hmac-auth');
        loadExtensions('acls');
    } else {
        $scope.title = "Add a Consumer";
        $scope.action = "Create";
    }

    $scope.save = function () {
        Kong.put('/consumers', $scope.consumer).then(function () {
            if ($routeParams.id) {
                Alert.success('Consumer updated');
            } else {
                Alert.success('Consumer created');
                // clearing inputs.
                $scope.consumer = {};
            }
            // clearing errors.
            $scope.error = {};
        }, function (response) {
            $scope.error = response.data;
        });
    };

    $scope.hideForm = function(type) {
        var form = type.split('_').reduce(function (previous, current) {
            return previous + current.substring(0, 1).toUpperCase() + current.substring(1);
        }, "");
        form = form.substring(0, 1).toLowerCase() + form.substring(1);
        $scope[form + 'FormDisplayed'] = false;
    };
    $scope.displayForm = function(type) {
        $scope['new_' + type] = {};
        var form = type.split('_').reduce(function (previous, current) {
            return previous + current.substring(0, 1).toUpperCase() + current.substring(1);
        }, "");
        form = form.substring(0, 1).toLowerCase() + form.substring(1);
        $scope[form + 'FormDisplayed'] = true;
    };

    $scope.postNewExtension = function(type) {
        var endpoint = type.replace(/\_/g, '-');
        Kong.post('/consumers/' + $scope.consumer.id + '/' + endpoint, $scope['new_' + type]).then(function() {
            $scope.error = {};
            Alert.success('Record saved');
            loadExtensions(endpoint);
            $scope.hideForm(type);
        }, function(response) {
            $scope.error = {};
            $scope.error['new_' + type] = response.data;
        });
    };

    var extension_type = null;
    var extension_id = null;
    $scope.showDeleteModal = function(type, id) {
        extension_type = type;
        extension_id = id;
        $('#deleteCredentials').modal('open');
    };
    $scope.performDelete = function() {
        var endpoint = extension_type.replace(/\_/g, '-');
        $('#deleteCredentials').modal('close');
        Kong.delete('/consumers/' + $scope.consumer.id + '/' + endpoint + '/' + extension_id).then(function(response) {
            Alert.success('Record deleted');
            loadExtensions(endpoint);
        });
    };
    $scope.abortDelete = function() {
        $('#deleteCredentials').modal('close');
    };

    function loadExtensions(endpoint) {
        Kong.get('/consumers/' + $scope.consumer.id + '/' + endpoint).then(function(response) {
            type = endpoint.replace(/\-/g, '_');
            $scope[type] = response;
        });
    }
}]);
