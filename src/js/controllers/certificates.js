angular.module('app').controller("CertificatesController", ["$scope", "Kong", function ($scope, Kong) {
  $scope.certificates = [];
  $scope.total = null;
  $scope.offset = null;
  $scope.searchResults = {};
  $scope.searching = false;

  var loaded_pages = [];

  $scope.loadMore = function() {
    var page = '/certificates?';
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
      $scope.certificates.push.apply($scope.certificates, collection.data);
      $scope.total += collection.total;
      $scope.offset = collection.offset ? collection.offset : null;
    });
  };
  $scope.loadMore();

  $scope.showDeleteModal = function (id) {
    $scope.current = {id: id};
    $('#deleteCertificate').modal('open');
  };

  $scope.abortDelete = function () {
    $('#deleteCertificate').modal('close');
  };

  $scope.performDelete = function () {
    $('#deleteCertificate').modal('close');
    Kong.delete('/certificates/' + $scope.current.id).then(function (response) {
      $scope.total -= 1;
      $scope.certificates.forEach(function(element, index) {
        if (element.id === $scope.current.id) {
          $scope.certificates.splice(index, 1);
        }
      });
    });
  };
}]);
