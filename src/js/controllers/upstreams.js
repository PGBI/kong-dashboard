angular.module('app').controller("UpstreamsController", ["$scope", "Kong", function ($scope, Kong) {
  $scope.upstreams = [];
  $scope.total = null;
  $scope.offset = null;
  $scope.searchResults = {};
  $scope.searching = false;

  var loaded_pages = [];

  $scope.loadMore = function() {
    var page = '/upstreams?';
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
      $scope.upstreams.push.apply($scope.upstreams, collection.data);
      $scope.total += collection.total;
      $scope.offset = collection.offset ? collection.offset : null;
    });
  };
  $scope.loadMore();

  $scope.showDeleteModal = function (id, name) {
    $scope.current = {id: id, name: name};
    $('#deleteUpstream').modal('open');
  };

  $scope.abortDelete = function () {
    $('#deleteUpstream').modal('close');
  };

  $scope.performDelete = function () {
    $('#deleteUpstream').modal('close');
    Kong.delete('/upstreams/' + $scope.current.id).then(function (response) {
      $scope.total -= 1;
      $scope.upstreams.forEach(function(element, index) {
        if (element.id === $scope.current.id) {
          $scope.upstreams.splice(index, 1);
        }
      });
    });
  };

  $scope.searchUpstreams = function() {
    $scope.searchResults = {};
    var input = $scope.searchInput;
    if (!input) {
      $scope.searching = false;
      return;
    }

    $scope.searching = true;

    var populateResults = function(response) {
      angular.forEach(response.data, function(value) {
        $scope.searchResults[value.id] = value.name;
      });
    };

    Kong.get('/upstreams?id=' + input).then(populateResults);
    Kong.get('/upstreams?name=' + input).then(populateResults);
  };
}]);
