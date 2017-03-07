angular.module('app').controller("PluginsController", ["pluginsCollection", "$scope", "Kong", "$route", "$location", "$routeParams", "owner", "Alert", function (pluginsCollection, $scope, Kong, $route, $location, $routeParams, $owner, Alert) {
    if ($routeParams.api_id) {
        $scope.owner_type = 'API';
    } else if ($routeParams.consumer_id) {
        $scope.owner_type = 'Consumer';
    } else {
        $scope.owner_type = null;
    }
    $scope.owner = $owner;

    $scope.plugins = pluginsCollection.data;
    $scope.total = pluginsCollection.total;
    $scope.next = pluginsCollection.next;
    $scope.size = $route.current.params.size;
    $scope.offset = pluginsCollection.next ? /offset=([^&]+)/.exec(pluginsCollection.next)[1] : null;
    $scope.location = $location;

    angular.forEach($scope.plugins, function(plugin) {
        Kong.get('/apis/' + plugin.api_id).then(function(api) {
            plugin.api_name = api.name;
        });
        if (plugin.consumer_id) {
            Kong.get('/consumers/' + plugin.consumer_id).then(function(consumer) {
                plugin.consumer_username = consumer.username;
            });
        }
    });

    $scope.showDeleteModal = function (name, id) {
        $scope.current = {name: name, id: id};
        $('#deletePlugin').openModal();
    };
    $scope.abortDelete = function () {
        $('#deletePlugin').closeModal();
    };
    $scope.performDelete = function () {
        $('#deletePlugin').closeModal();
        Kong.delete('/plugins/' + $scope.current.id).then(function () {
            $route.reload();
        });
    };

    $scope.updatePluginStatus = function(id, status) {
        Kong.patch('/plugins/' + id, {
            enabled: status
        }).then(function () {
            if (status) {
                Alert.success('Plugin enabled');
            } else {
                Alert.success('Plugin disabled');
            }
        }, function(response) {
            Alert.error('Sorry, we got confused. Please refresh the page.');
        });
    }
}]);
