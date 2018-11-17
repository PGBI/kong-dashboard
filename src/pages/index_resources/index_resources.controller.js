(function() {
  'use strict';

  angular
    .module('app')
    .controller('IndexResources', IndexResources);

  IndexResources.$inject = ["resourceType", "resourceName", "Kong", "Alert", "parentType", "parent"];

  function IndexResources(resourceType, resourceName, Kong, Alert, parentType, parent) {
    var vm = this;

    vm.resources = null;
    vm.resourceType = resourceType;
    vm.resourceName = resourceName;

    var fetchEndpoint = '/' + resourceType.toLowerCase() + 's?';
    if (parent) {
      fetchEndpoint = '/' + parentType.toLowerCase() + 's/' + parent.id + fetchEndpoint;
    }

    switch(resourceType) {
      case 'acl':
        vm.title = 'Groups Consumer "' + (parent.username || parent.custom_id) + '" belongs to.';
        vm.createLink = '#!/consumers/' + parent.id + '/groups/add';
        fetchEndpoint = '/acls?consumer_id=' + parent.id;
        break;
      case 'API':
        vm.title = 'APIs';
        vm.createLink = '#!/apis/add';
        break;
      case 'basic-auth-credential':
        vm.title = 'Credentials of Consumer "' + (parent.username || parent.custom_id) + '"';
        vm.createLink = '#!/consumers/' + parent.id + '/basic-auth-credential/add';
        fetchEndpoint = '/basic-auths?consumer_id=' + parent.id;
        break;
      case 'certificate':
        vm.title = 'Certificates';
        vm.createLink = '#!/certificates/add';
        break;
      case 'consumer':
        vm.title = 'Consumers';
        vm.createLink = '#!/consumers/add';
        break;
      case 'jwt-credential':
        vm.title = 'JWT credentials of Consumer "' + (parent.username || parent.custom_id) + '"';
        vm.createLink = '#!/consumers/' + parent.id + '/jwt-credentials/add';
        fetchEndpoint = '/consumers/' + parent.id + '/jwt';
        break;
      case 'auth-key':
        vm.title = 'Keys of Consumer "' + (parent.username || parent.custom_id) + '"';
        vm.createLink = '#!/consumers/' + parent.id + '/auth-keys/add';
        fetchEndpoint = '/key-auths?consumer_id=' + parent.id;
        break;
      case 'hmac-credential':
        vm.title = 'Hmac credentials of Consumer "' + (parent.username || parent.custom_id) + '"';
        vm.createLink = '#!/consumers/' + parent.id + '/hmac-credentials/add';
        fetchEndpoint = '/hmac-auths?consumer_id=' + parent.id;
        break;
      case 'oauth2-credential':
        vm.title = 'Oauth2 credentials of Consumer "' + (parent.username || parent.custom_id) + '"';
        vm.createLink = '#!/consumers/' + parent.id + '/oauth2-credentials/add';
        fetchEndpoint = '/oauth2?consumer_id=' + parent.id;
        break;
      case 'plugin':
        vm.createLink = '#!/plugins/add';
        switch (parentType) {
          case 'API':
            vm.title = 'Plugins of API "' + parent.name + '"';
            break;
          case 'consumer':
            vm.title = 'Plugins of Consumer "' + (parent.username || parent.custom_id) + '"';
            break;
          default:
            vm.title = 'Plugins';
        }
        break;
      case 'route':
        switch (parentType) {
          case 'service':
            vm.title = 'Routes of Service "' + parent.name + '"';
            vm.createLink = '#!/services/' + parent.id + '/routes/add';
            break;
          default:
            vm.title = 'Routes';
        }
        break;
      case 'service':
        vm.title = 'Services';
        vm.createLink = '#!/services/add';
        break;
      case 'target':
        vm.title = 'Targets of Upstream "' + parent.name + '"';
        vm.createLink = '#!/upstreams/' + parent.id + '/targets/add';
        break;
      case 'upstream':
        vm.title = 'Upstreams';
        vm.createLink = '#!/upstreams/add';
        break;
      default:
        break;
    }

    vm.showDeleteModal = function (name, id) {
      vm.current = {name: name, id: id};
      $('#deleteResource').modal('open');
    };

    vm.abortDelete = function () {
      $('#deleteResource').modal('close');
    };

    vm.performDelete = function () {
      $('#deleteResource').modal('close');

      var endpoint;
      if (vm.resourceType == 'target') {
        endpoint = '/upstreams/' + parent.id + '/targets/' + vm.current.id;
      } else if (vm.resourceType == 'acl') {
        endpoint = '/consumers/' + parent.id + '/acls/' + vm.current.id;
      } else if (vm.resourceType == 'auth-key') {
        endpoint = '/consumers/' + parent.id + '/key-auth/' + vm.current.id;
      } else if (vm.resourceType == 'basic-auth-credential') {
        endpoint = '/consumers/' + parent.id + '/basic-auth/' + vm.current.id;
      } else if (vm.resourceType == 'hmac-credential') {
        endpoint = '/consumers/' + parent.id + '/hmac-auth/' + vm.current.id;
      } else if (vm.resourceType == 'oauth2-credential') {
        endpoint = '/consumers/' + parent.id + '/oauth2/' + vm.current.id;
      } else if (vm.resourceType == 'jwt-credential') {
        endpoint = '/consumers/' + parent.id + '/jwt/' + vm.current.id;
      } else {
        endpoint = '/' + resourceType.toLowerCase() + 's/' + vm.current.id;
      }

      Kong.delete(endpoint).then(function () {
        vm.resources.forEach(function(element, index) {
          if (element.id === vm.current.id) {
            vm.resources.splice(index, 1);
          }
        });
      });
    }

    var nextPageLoading = false;
    var nextPage = fetchEndpoint;
    vm.loadNextPage = function () {
      if (nextPageLoading || !nextPage) {
        return;
      }
      nextPageLoading = true;
      Kong.get(nextPage).then(function(response) {
        if (vm.resources === null) {
          vm.resources = [];
        }
        vm.resources.push.apply(vm.resources, response.data);
        nextPage = response.offset ? fetchEndpoint + '&offset=' + encodeURIComponent(response.offset) : null;
        nextPageLoading = false;

        // appending related resources, if any.
        vm.resources.forEach(function(resource) {
          if (!resource.api && resource.api_id) {
            Kong.get('/apis/' + resource.api_id).then(function(api) {
              resource.api = api;
            });
          }
          if (!resource.consumer && resource.consumer_id) {
            Kong.get('/consumers/' + resource.consumer_id).then(function(consumer) {
              resource.consumer = consumer;
            });
          }
          if (resource.service && !resource.service.name) {
            Kong.get('/services/' + resource.service.id).then(function(service) {
              resource.service = service;
            });
          }
          if (!resource.service && resource.service_id) {
            Kong.get('/services/' + resource.service_id).then(function(service) {
              resource.service = service;
            });
          }
          if (!resource.route && resource.route_id) {
            Kong.get('/routes/' + resource.route_id).then(function(route) {
              resource.route = route;
            });
          }
        });
      });
    }

    vm.tooglePluginStatus = function (plugin) {
      plugin.enabled = !plugin.enabled;
      Kong.patch('/plugins/' + plugin.id, {
        enabled: plugin.enabled
      }).then(function () {
        if (plugin.enabled) {
          Alert.success('Plugin enabled');
        } else {
          Alert.success('Plugin disabled');
        }
      });
    }

    vm.searchResults = {};
    vm.searchConsumers = function() {
      vm.searchResults = {};
      var input = vm.searchInput;
      if (!input) {
        vm.searching = false;
        return;
      }

      vm.searching = true;

      var populateResults = function(response) {
        angular.forEach(response.data, function(value) {
          vm.searchResults[value.id] = value.username || value.custom_id;
        });
      };

      Kong.get('/consumers?username=' + input).then(populateResults);
      Kong.get('/consumers?id=' + input).then(populateResults);
      Kong.get('/consumers?custom_id=' + input).then(populateResults);
      Kong.get('/oauth2?client_id=' + input).then(function(response) {
        angular.forEach(response.data, function(value) {
          Kong.get('/consumers?id=' + value.consumer_id).then(populateResults);
        });
      });
    };
  }
})();
