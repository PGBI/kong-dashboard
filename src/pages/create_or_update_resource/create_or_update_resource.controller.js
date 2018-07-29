(function() {
  'use strict';

  angular
    .module('app')
    .controller('CreateOrUpdateResource', CreateOrUpdateResource);

  CreateOrUpdateResource.$inject = ["resourceType", "resourceName", "Kong", "Alert", "parentType", "parent", "$route", "resource", "env"];

  function CreateOrUpdateResource(resourceType, resourceName, Kong, Alert, parentType, parent, $route, resource, env) {
    var vm = this;

    vm.resource = resource ? angular.copy(resource) : {};
    vm.resourceType = resourceType;
    vm.resourceName = resourceName;
    vm.errors = {};
    vm.action = resource ? 'Update' : 'Create';
    vm.schema = env.schemas[vm.resourceType.toLowerCase()];

    switch(resourceType) {
      case 'acl':
        vm.title = 'Add Consumer "' + (parent.username || parent.custom_id) + '" to a Group.';
        vm.resource.consumer_id = parent.id;
        break;
      case 'API':
        vm.title = resource ? 'Update API' : 'Create API';
        break;
      case 'basic-auth-credential':
        vm.title = resource ? 'Update credential' : 'Create basic auth credential for Consumer "' + (parent.username || parent.custom_id) + '"';
        delete vm.schema.properties.consumer_id;
        vm.resource.consumer_id = parent.id;
        break;
      case 'certificate':
        vm.title = resource ? 'Update Certificate' : 'Create Certificate';
        break;
      case 'consumer':
        vm.title = resource ? 'Update Consumer' : 'Create Consumer';
        break;
      case 'hmac-credential':
        vm.title = resource ? 'Update credential' : 'Create HMAC credential for Consumer "' + (parent.username || parent.custom_id) + '"';
        vm.resource.consumer_id = parent.id;
        break;
      case 'jwt-credential':
        vm.title = 'Create a JWT for Consumer "' + (parent.username || parent.custom_id) + '"';
        vm.resource.consumer_id = parent.id;
        break;
      case 'auth-key':
        vm.title = resource ? 'Update Key' : 'Create a Key for Consumer "' + (parent.username || parent.custom_id) + '"';
        delete vm.schema.properties.consumer_id;
        vm.resource.consumer_id = parent.id;
        break;
      case 'oauth2-credential':
        vm.title = resource ? 'Update Oauth2 credential' : 'Create an oauth2 credential for Consumer "' + (parent.username || parent.custom_id) + '"';
        delete vm.schema.properties.consumer_id;
        vm.resource.consumer_id = parent.id;
        break;
      case 'plugin':
        vm.title = resource ? 'Update Plugin' : 'Create Plugin';
        break;
      case 'route':
        vm.title = resource ? 'Update Route' : 'Create Route for Service "' + parent.name + '"';
        delete vm.schema.properties.service;
        if (parent) {
          vm.resource.service = {id: parent.id};
        }
        break;
      case 'service':
        vm.title = resource ? 'Update Service' : 'Create Service';
        break;
      case 'target':
        vm.title = resource ? 'Update Target' : 'Create Target';
        break;
      case 'upstream':
        vm.title = resource ? 'Update Upstream' : 'Create Upstream';
        break;
      default:
        break;
    }

    vm.saveResource = function () {

      var onSuccess = function() {
        if (resource) {
          Alert.success(vm.resourceName + ' updated');
          // clearing errors.
          vm.errors = {};
        } else {
          Alert.success(vm.resourceName + ' created');
          $route.reload();
        }
      }

      var onError = function(response) {
        if (response.status == 400 || response.status == 409) {
          vm.errors = Kong.unflattenErrorResponse(response.data);
        } else {
          Alert.error('Unexpected error from Kong');
          console.log(response);
        }
      }

      if (resource) {
        var payload = angular.copy(vm.resource);
        delete payload.id;
        delete payload.created_at;
        Kong.patch(getPatchEndpoint(), payload).then(onSuccess, onError);
      } else {
        Kong.post(getPostEndpoint(), vm.resource).then(onSuccess, onError);
      }
    }

    function getPostEndpoint()
    {
      var endpoint = '/' + vm.resourceType.toLowerCase() + 's';
      if (vm.resourceType == 'acl') {
        endpoint = '/consumers/' + parent.id + '/acls';
      }
      else if (vm.resourceType == 'auth-key') {
        endpoint = '/consumers/' + parent.id + '/key-auth';
      }
      else if (vm.resourceType == 'basic-auth-credential') {
        endpoint = '/consumers/' + parent.id + '/basic-auth';
      }
      else if (vm.resourceType == 'hmac-credential') {
        endpoint = '/consumers/' + parent.id + '/hmac-auth';
      }
      else if (vm.resourceType == 'oauth2-credential') {
        endpoint = '/consumers/' + parent.id + '/oauth2';
      }
      else if (vm.resourceType == 'jwt-credential') {
        endpoint = '/consumers/' + parent.id + '/jwt';
      }
      else if (vm.resourceType == 'target') {
        endpoint = '/upstreams/' + parent.id + '/targets';
      }

      return endpoint;
    }

    function getPatchEndpoint()
    {
      return '/' + vm.resourceType.toLowerCase() + 's/' + vm.resource.id;
    }
  }
})();
