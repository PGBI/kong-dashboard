angular.module('app').controller("PluginController", ["$scope", "Kong", "$location", "$routeParams", "plugins", "apis", "consumers", "plugin", "Alert", function ($scope, Kong, $location, $routeParams, plugins, apis, consumers, plugin, Alert) {
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
            if ($scope.plugin_schema.no_consumer) {
                delete $scope.plugin.consumer_id;
            }
            if ($scope.mode === 'create') {
                $scope.plugin.config = {};
            }
            populatePluginWithDefaultValues();
            afterFind($scope.plugin.config, $scope.plugin_schema.fields);
        });
    };

    $scope.isPublic = function (fieldName) {
        return fieldName.slice(0, 1) != '_';
    };

    if (plugin) {
        $scope.title = "Edit Plugin";
        $scope.action = "Save";
        $scope.loadSchema();
    } else {
        $scope.title = "Add plugin";
        $scope.action = "Add";
    }

    $scope.save = function () {
        beforeSave($scope.plugin.config, $scope.plugin_schema.fields);
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
            $scope.error = {};
            if ($scope.mode === 'create') {
                $scope.plugin = {};
                $scope.plugin_schema_loaded = false;
            } else {
                $scope.plugin = response;
                populatePluginWithDefaultValues();
            }
            afterFind($scope.plugin.config, $scope.plugin_schema.fields);
        }, function (response) {
            $scope.error = response.data;
            // if error not linked to a specific field, throw an error notification.
            if (response.data.config && angular.isString(response.data.config)) {
                Alert.error(response.data.config);
            }
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

    $scope.removeFormObject = function(field, sub_field) {
        if ($scope.plugin.config[field][sub_field]) {
            delete $scope.plugin.config[field][sub_field];
        }
    };

    function populatePluginWithDefaultValues() {
        angular.forEach($scope.plugin_schema.fields, function(fieldAttrs, fieldName) {
            if ($scope.isPublic(fieldName)) {
                if (fieldAttrs.hasOwnProperty('default') && fieldAttrs.default !== 'function') {
                    if (!$scope.plugin.hasOwnProperty('config')) {
                        $scope.plugin.config = {};
                    }
                    if (!$scope.plugin.config.hasOwnProperty(fieldName)) {
                        $scope.plugin.config[fieldName] = fieldAttrs.default;
                    }
                }
            }
        });
    }

    /**
     * Transform the plugin object before saving it into kong.
     * @param obj
     * @param schema
     */
    function beforeSave(obj, schema) {
        if (typeof obj === 'undefined') {
            return;
        }
        angular.forEach(schema, function(attrs, key) {
            if (attrs.type === 'table') {
                if (attrs.schema.flexible) {
                    angular.forEach(obj[key], function(value, sub_key) {
                        beforeSave(obj[key][sub_key], schema[key].schema.fields)
                    });
                } else {
                    beforeSave(obj[key], schema[key].schema.fields);
                }
            } else if (attrs.type === 'array') {
                if (!obj.hasOwnProperty(key) || obj[key] === '' || angular.equals(obj[key], {})) {
                    delete obj[key]; // Fix issue #11
                }
            } else if (attrs.type === 'string' || attrs.type === 'url') {
                if (angular.isString(obj[key]) && obj[key] === '') {
                    // do nothing
                }
            } else if (attrs.type === 'number') {
                if (angular.isString(obj[key]) && obj[key] === '') {
                    delete obj[key];
                }
            }
        });
    }

    /**
     * Transform the plugin object after being retrieved from Kong to be compatible with html forms (example:
     * transform arrays into comma separated lists).
     * @param obj
     * @param schema
     */
    function afterFind(obj, schema) {
        angular.forEach(obj, function(value, key) {
            if (angular.equals(value, {}) && schema[key].type === 'array') {
                obj[key] = [];
            }
            if (schema[key].type === 'array') {
                if (!schema[key].enum) {
                    obj[key] = obj[key].join();
                }
            } else if (schema[key].type == 'table' && !schema[key].schema.flexible) {
                afterFind(obj[key], schema[key].schema.fields);
            }
        });
    }
}]);
