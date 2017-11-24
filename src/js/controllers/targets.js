angular.module('app').controller("TargetsController", ["$scope", "Kong", "$routeParams", "upstream", function ($scope, Kong, $routeParams, upstream) {
  $scope.targets = [];
  $scope.total = null;
  $scope.offset = null;
  $scope.searchResults = {};
  $scope.searching = false;
  $scope.upstream = upstream;
  $scope.active = true;
  $scope.title = '';

  var loaded_pages = [];

  onInit();

  function onInit() {
    $scope.title = 'Targets of ' + upstream.name;
  }

  $scope.loadMore = function() {
    var page = '/upstreams/' + upstream.id + '/targets';
    if ($scope.active) {
      page += "/active";
    }
    if ($scope.offset) {
      page += '?offset=' + $scope.offset + '&';
    }
    if (loaded_pages.indexOf(page) !== -1) {
      return;
    }
    loaded_pages.push(page);

    Kong.get(page).then(function(collection) {
      if ($scope.total === null) {
        $scope.total = 0;
      }
      $scope.targets.push.apply($scope.targets, collection.data);
      $scope.total += collection.total;
      $scope.offset = collection.offset ? collection.offset : null;
    });
  };
  $scope.loadMore();

  $scope.test = function() {
    console.log('active == ' + $scope.active);
  }

  $scope.reloadList = function() {
    $scope.targets = [];
    $scope.total = null;
    $scope.offset = null;
    loaded_pages = [];
    $scope.loadMore();
  }

  $scope.showDeleteModal = function (id, name, upstream_id) {
    $scope.current = {id: id, name: name, upstream_id : upstream_id};
    $('#deleteTarget').modal('open');
  };

  $scope.abortDelete = function () {
    $('#deleteTarget').modal('close');
  };

  $scope.performDelete = function () {
    $('#deleteTarget').modal('close');
    Kong.delete('/upstreams/' + $scope.current.upstream_id + '/targets/' + $scope.current.id ).then(function (response) {
      $scope.total -= 1;
      $scope.targets.forEach(function(element, index) {
        if (element.id === $scope.current.id) {
          $scope.targets.splice(index, 1);
        }
      });
    });
  };
}]);
