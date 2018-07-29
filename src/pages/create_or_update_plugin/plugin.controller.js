(function() {
  'use strict';

  angular
    .module('app')
    .controller("PluginController", PluginController);

  PluginController.$inject = ["Kong","plugins","apis","consumers", "services", "routes", "plugin","Alert","$route", "$scope"];

  function PluginController (Kong, plugins, apis, consumers, services, routes, plugin, Alert, $route, $scope) {
    var vm = this;
    vm.errors = {};
    vm.consumers = consumers;
    vm.plugin = plugin ? angular.copy(plugin) : {};
    vm.plugin_schema_loaded = false;
    if (!vm.plugin.api_id) {
      vm.plugin.api_id = null;
    }

    if (plugin) {
      vm.title = "Edit Plugin";
      vm.action = "Save";
    } else {
      vm.title = "Add plugin";
      vm.action = "Add";
    }

    var enabledPlugins = Array.isArray(plugins.enabled_plugins) ?
      plugins.enabled_plugins :
      Object.keys(plugins.enabled_plugins); // Happens with kong 0.9.0. See issue #52

    var apisOptions = {'All': null};
    apis.data.forEach(function (api) {
      apisOptions[api.name] = api.id
    });

    var consumersOptions = {'All': null};
    consumers.data.forEach(function (consumer) {
      consumersOptions[consumer.username] = consumer.id
    });


    var routesOptions = {'All': null};
    routes.data.forEach(function (route) {
      routesOptions[route.username] = route.id
    });

    vm.schema = {
      properties: {
        'api_id': {
          required: false,
          type: 'string',
          'enum': apisOptions,
          label: 'Which API(s) should this plugin apply to?'
        },
        'route_id': {
          required: false,
          type: 'string',
          'enum': routesOptions,
          label: 'Which Route(s) should this plugin apply to?'
        },
        'name': {
          required: true,
          type: 'string',
          'enum': enabledPlugins.sort(),
          label: 'Plugin',
          readonly: plugin != null
        }
      }
    };

    if (services) {
      var servicesOptions = {'All': null};
      services.data.forEach(function (service) {
        servicesOptions[service.name] = service.id
      });
      vm.schema.properties['service_id'] = {
        required: false,
        type: 'string',
        'enum': servicesOptions,
        label: 'Which Service(s) should this plugin apply to?'
      };
    }

    if (routes) {
      var routesOptions = {'All': null};
      routes.data.forEach(function (route) {
        routesOptions[route.id] = route.id
      });
      vm.schema.properties['route_id'] = {
        required: false,
        type: 'string',
        'enum': routesOptions,
        label: 'Which Routes(s) should this plugin apply to?'
      };
    }

    $scope.$watch('vm.plugin.name', loadSchema);


    vm.save = function () {
      var plugin = angular.copy(vm.plugin);
      if (!vm.plugin.api_id) {
        // Kong 0.9.x will fail if the body payload contains {api_id: null}
        delete vm.plugin.api_id;
      }
      if (!vm.plugin.name) {
        Alert.error("You must choose a plugin.");
        return;
      }
      var endpoint = '/plugins';
      var data = vm.plugin;

      Kong.put(endpoint, data).then(function (response) {
        Alert.success('Plugin saved!');
        $route.reload();
      }, function (response) {
        if (!response) {
          // unexpected error message already displayed by Kong service.
          return;
        }
        if (response.status == 400 || response.status == 409) {
          vm.errors = Kong.unflattenErrorResponse(response.data);
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
      vm.plugin_schema_loaded = false;
      vm.plugin_schema_loading = true;
      Kong.get('/plugins/schema/' + vm.plugin.name).then(function (response) {

        delete(vm.schema.properties.consumer_id);
        delete(vm.schema.properties.config);

        if (!response.no_consumer) {
          vm.schema.properties.consumer_id = {
            required: false,
            type: 'string',
            'enum': consumersOptions,
            label: 'Which Consumers(s) should this plugin apply to?'
          }
        } else {
          delete vm.schema.properties.consumer_id;
          delete vm.plugin.consumer_id;
        }

        vm.schema.properties.config = convertPluginSchema(response);
        vm.plugin_schema_loaded = true;
        vm.plugin_schema_loading = false;
        if (vm.mode === 'create') {
          vm.plugin.config = {};
        }

        vm.errors = {};
      });
    };

    /**
     * Convert a "kong" schema to a schema compatible with http://json-schema.org
     * @param schema
     */
    function convertPluginSchema(schema) {
      var result = {properties: {}, type: 'object'};
      Object.keys(schema.fields).forEach(function (propertyName) {
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
            result.properties[propertyName].additionalProperties = convertPluginSchema(schema.fields[propertyName].schema);
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
  }
})();
