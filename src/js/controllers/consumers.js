angular.module('app').controller("ConsumersController", ["$scope", "Kong", function ($scope, Kong) {
  $scope.consumers = [];
  $scope.total = null;
  $scope.offset = null;
  $scope.gelato = Kong.config.gelato;
  $scope.searchResults = {};
  $scope.searching = false;

  var loaded_pages = [];

  $scope.loadMore = function() {
    var page = '/consumers?';
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
      $scope.consumers.push.apply($scope.consumers, collection.data);
      $scope.total += collection.total;
      $scope.offset = collection.offset ? collection.offset : null;
    });
  };
  $scope.loadMore();

  $scope.showDeleteModal = function (username, id) {
    $scope.current = {username: username, id: id};
    $('#deleteConsumer').openModal();
  };

  $scope.abortDelete = function () {
    $('#deleteConsumer').closeModal();
  };

  $scope.performDelete = function () {
    $('#deleteConsumer').closeModal();
    Kong.delete('/consumers/' + $scope.current.id).then(function (response) {
      $scope.total -= 1;
      $scope.consumers.forEach(function(element, index) {
        if (element.id === $scope.current.id) {
          $scope.consumers.splice(index, 1);
        }
      });
    });
  };

  $scope.searchConsumers = function() {
    $scope.searchResults = {};
    var input = $scope.searchInput;
    if (!input) {
      $scope.searching = false;
      return;
    }

    $scope.searching = true;

    var populateResults = function(response) {
      angular.forEach(response.data, function(value) {
        $scope.searchResults[value.id] = value.username || value.custom_id;
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
}]);
