angular.module('app').controller("PluginController", ["$scope", "Kong", "$location", "$routeParams", "plugins", "apis", "consumers", "plugin", "Alert", function ($scope, Kong, $location, $routeParams, plugins, apis, consumers, plugin, Alert)
{
    var mode;
    if (plugin) {
        $scope.title = "Edit Plugin";
        $scope.action = "Save";
        mode = 'edit';
    } else {
        $scope.title = "Add plugin";
        $scope.action = "Add";
        mode = 'create';
    }

    var enabledPlugins = Array.isArray(plugins.enabled_plugins) ?
      plugins.enabled_plugins :
      Object.keys(plugins.enabled_plugins); // Happens with kong 0.9.0. See issue #52

    var apisOptions = {'All': null};
    apis.data.forEach(function(api) {
        apisOptions[api.name] = api.id
    });
    var consumerOptions = {'All': null};
    consumers.data.forEach(function(consumer) {
        consumerOptions[consumer.username] = consumer.id
    });

    $scope.schema = {
        properties: {
            'api_id': {
                required: false,
                type: 'string',
                'enum': apisOptions,
                label: 'Which API(s) should this plugin apply to?'
            },
            'name': {
                required: true,
                type: 'string',
                'enum': enabledPlugins.sort(),
                label: 'Plugin',
                readonly: mode === 'edit'
            }
        }
    };
    $scope.plugin = plugin || {};
    if (!$scope.plugin.api_id) {
        $scope.plugin.api_id = null;
    }

    $scope.errors = {};

    $scope.$watch('plugin.name', loadSchema);

    $scope.consumers = consumers;
    $scope.mode = plugin ? 'edit' : 'create';

    $scope.save = function () {
        var plugin = angular.copy($scope.plugin);
        if (!$scope.plugin.api_id) {
            // Kong 0.9.x will fail if the body payload contains {api_id: null}
            delete $scope.plugin.api_id;
        }
        if (!$scope.plugin.name) {
            Alert.error("You must choose a plugin.");
            return;
        }
        var endpoint = '/plugins';
        var data = $scope.plugin;

        Kong.put(endpoint, data).then(function (response) {
            Alert.success('Plugin saved!');
            $scope.errors = {};
            if ($scope.mode === 'create') {
                $scope.plugin = {};
            } else {
                $scope.plugin = response;
                if (!$scope.plugin.hasOwnProperty('api_id')) {
                    $scope.plugin.api_id = null;
                }
            }
        }, function (response) {
            if (!response) {
                // unexpected error message already displayed by Kong service.
                return;
            }
            if (response.status == 400 || response.status == 409) {
                $scope.errors = response.data;
            } else {
                Alert.error('Unexpected error from Kong');
                console.log(response);
            }
        });
    };

    function loadSchema(pluginName) {
        if (typeof pluginName === 'undefined') {
            return;
        }
        $scope.plugin_schema_loaded = false;
        $scope.plugin_schema_loading = true;
        Kong.get('/plugins/schema/' + $scope.plugin.name).then(function (response) {

            delete($scope.schema.properties.consumer_id);
            delete($scope.schema.properties.config);

            if (!response.no_consumer) {
                $scope.schema.properties.consumer_id = {
                    required: false,
                    type: 'string',
                    'enum': consumerOptions,
                    label: 'Apply to'
                }
            } else {
                delete $scope.schema.properties.consumer_id;
                delete $scope.plugin.consumer_id;
            }

            $scope.schemaBefore = response;
            $scope.schemaAfter = convertPluginSchema(response);

            $scope.schema.properties.config = convertPluginSchema(response);
            $scope.plugin_schema_loaded = true;
            $scope.plugin_schema_loading = false;
            if ($scope.mode === 'create') {
                $scope.plugin.config = {};
            }
        });
    };

    /**
     * Convert a "kong" schema to a schema compatible with http://json-schema.org
     * @param schema
     */
    function convertPluginSchema(schema) {
        var result = {properties: {}, type: 'object'};
        Object.keys(schema.fields).forEach(function(propertyName) {
            result.properties[propertyName] = {
                type: schema.fields[propertyName].type
            };
            if (schema.fields[propertyName].enum) {
                result.properties[propertyName].enum = schema.fields[propertyName].enum;
            }
            if (schema.fields[propertyName].hasOwnProperty('default')) {
                result.properties[propertyName].default = schema.fields[propertyName].default;
            }
            if (schema.fields[propertyName].hasOwnProperty('required')) {
                result.properties[propertyName].required = schema.fields[propertyName].required;
            }
            if (result.properties[propertyName].type === 'table') {
                result.properties[propertyName].type = 'object';
                if (schema.fields[propertyName].schema.flexible) {
                    result.properties[propertyName].additionalProperties = convertPluginSchema(schema.fields[propertyName].schema).properties;
                } else {
                    result.properties[propertyName].properties = convertPluginSchema(schema.fields[propertyName].schema).properties;
                }
            }

            if (result.properties[propertyName].type === 'array') {
                // by default, assuming the elements of a property of type array is a string, since it's
                // the case most of the time, and Kong doesn't provide the types of the elements of array properties :(
                result.properties[propertyName].items = {type: 'string'}
            }

        });
        return result;
    }
}]);
