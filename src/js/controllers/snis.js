angular.module('app').controller("SnisController", ["$scope", "Kong", function ($scope, Kong) {
  $scope.snis = [];
  $scope.total = null;
  $scope.offset = null;
  $scope.searchResults = {};
  $scope.searching = false;

  var loaded_pages = [];

  $scope.loadMore = function() {
    var page = '/snis?';
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
      $scope.snis.push.apply($scope.snis, collection.data);
      $scope.total += collection.total;
      $scope.offset = collection.offset ? collection.offset : null;
    });
  };
  $scope.loadMore();

  $scope.showDeleteModal = function (name) {
    $scope.current = {name: name};
    $('#deleteSni').modal('open');
  };

  $scope.abortDelete = function () {
    $('#deleteSni').modal('close');
  };

  $scope.performDelete = function () {
    $('#deleteSni').modal('close');
    Kong.delete('/snis/' + $scope.current.name).then(function (response) {
      $scope.total -= 1;
      $scope.snis.forEach(function(element, index) {
        if (element.name === $scope.current.name) {
          $scope.snis.splice(index, 1);
        }
      });
    });
  };
}]);
