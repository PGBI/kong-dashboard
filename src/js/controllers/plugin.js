angular.module('app').controller("PluginController", ["$scope", "Kong", "$location", "$routeParams", "plugins", "apis", "consumers", "plugin", "Alert", "$route", function ($scope, Kong, $location, $routeParams, plugins, apis, consumers, plugin, Alert, $route) {
    $scope.enabled_plugins = plugins.enabled_plugins;
    $scope.plugin = plugin ? angular.copy(plugin) : {};
    $scope.error = {};
    $scope.apis = apis;
    $scope.consumers = consumers;
    $scope.mode = plugin ? 'edit' : 'create';

    $scope.loadSchema = function () {
        $scope.plugin_schema_loaded = false;
        $scope.plugin_schema_loading = true;
        Kong.get('/plugins/schema/' + $scope.plugin.name).then(function (response) {
            $scope.plugin_schema_loaded = true;
            $scope.plugin_schema_loading = false;
            $scope.plugin_schema = response;
            if($scope.plugin_schema.no_consumer) {
                delete $scope.plugin.consumer_id;
            }
            if($scope.mode === 'create') {
                populatePluginWithDefaultValues();
            }
        });
    };

    if (plugin) {
        $scope.title = "Edit Plugin";
        $scope.action = "Save";
        $scope.loadSchema();
    } else {
        $scope.title = "Add plugin";
        $scope.action = "Add";
    }

    $scope.isPublic = function (attr) {
        return attr.slice(0, 1) != '_';
    };

    $scope.save = function () {
        transformEmptyValues($scope.plugin.config, $scope.plugin_schema.fields, 0);
        if (!$scope.plugin.api_id) {
            Alert.error("You must select an API.");
            return;
        }
        if (!$scope.plugin.name) {
            Alert.error("You must choose a plugin.");
            return;
        }
        var endpoint = '/plugins';
        var data = $scope.plugin;

        Kong.put(endpoint, data).then(function (response) {
            Alert.success('Plugin saved!');
        }, function (response) {
            $scope.error = response.data;
        });
    };

    $scope.newObj = {};

    $scope.addFormObject = function(field, schema) {
        if (!$scope.newObj[field] || $scope.newObj[field] == '') {
            return;
        }
        if (!$scope.plugin.config[field]) {
            $scope.plugin.config[field] = {};
        }
        $scope.plugin.config[field][$scope.newObj[field]] = {};
        angular.forEach(schema, function(field_attrs, field_name) {
            var default_value = field_attrs.default ? field_attrs.default : '';
            $scope.plugin.config[field][$scope.newObj[field]][field_name] = default_value;
        });
        $scope.newObj[field] = '';
    };

    function populatePluginWithDefaultValues() {
        $scope.plugin.config = {};
        angular.forEach($scope.plugin_schema.fields, function(fieldAttrs, fieldName) {
            if ($scope.isPublic(fieldName)) {
                if (fieldAttrs.hasOwnProperty('default') && fieldAttrs.default !== 'function') {
                    $scope.plugin.config[fieldName] = fieldAttrs.default;
                }
            }
        });
    }

    function transformEmptyValues(obj, schema, depth) {
        angular.forEach(obj, function(value, key) {
            if (angular.isObject(value)) {
                transformEmptyValues(obj[key], schema[key].fields, depth+1);
            } else {
                if (value === '') {
                    if (depth > 0) {
                        delete obj[key];
                    }
                }
            }
        })
    }
}]);
