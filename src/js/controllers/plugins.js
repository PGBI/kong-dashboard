angular.module('app').controller("PluginsController", ["$scope", "Kong", "$route", "$location", "$routeParams", "owner", "Alert", function ($scope, Kong, $route, $location, $routeParams, $owner, Alert) {
    if ($routeParams.api_id) {
        $scope.owner_type = 'API';
    } else if ($routeParams.consumer_id) {
        $scope.owner_type = 'Consumer';
    } else {
        $scope.owner_type = null;
    }
    $scope.owner = $owner;
    $scope.plugins = [];
    $scope.total = null;
    $scope.offset = null;
    $scope.location = $location;

    var loaded_pages = [];
    $scope.loadMore = function() {
        var page;
        if ($scope.owner_type == 'Consumer') {
            page = '/plugins?consumer_id=' + $scope.owner.id + '&';
        } else if ($scope.owner_type == 'API') {
            page = '/plugins?api_id=' + $scope.owner.id + '&';
        } else {
            page = '/plugins?';
        }
        if ($scope.offset) {
            page += 'offset=' + $scope.offset + '&';
        }
        if (loaded_pages.indexOf(page) !== -1) {
            return;
        }
        loaded_pages.push(page);

        Kong.get(page).then(function(collection) {
            if ($scope.total === null) {
                $scope.total = 0;
            }
            $scope.plugins.push.apply($scope.plugins, collection.data);
            $scope.total += collection.total;
            $scope.offset = collection.offset ? collection.offset : null;
            angular.forEach($scope.plugins, function(plugin) {
                if (!plugin.api_name && plugin.api_id) {
                    Kong.get('/apis/' + plugin.api_id).then(function(api) {
                        plugin.api_name = api.name;
                    });
                }
                if (!plugin.consumer_name && plugin.consumer_id) {
                    Kong.get('/consumers/' + plugin.consumer_id).then(function(consumer) {
                        plugin.consumer_username = consumer.username;
                    });
                }
            });
        });
    };
    $scope.loadMore();

    $scope.showDeleteModal = function (name, id) {
        $scope.current = {name: name, id: id};
        $('#deletePlugin').modal('open');
    };
    $scope.abortDelete = function () {
        $('#deletePlugin').modal('close');
    };
    $scope.performDelete = function () {
        $('#deletePlugin').modal('close');
        Kong.delete('/plugins/' + $scope.current.id).then(function () {
            $scope.total -= 1;
            $scope.plugins.forEach(function(element, index) {
                if (element.id === $scope.current.id) {
                    $scope.plugins.splice(index, 1);
                }
            });
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
