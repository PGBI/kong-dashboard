angular.module('app').controller("ConsumersController", ["$scope", "Kong", "$route", function ($scope, Kong, $route) {
    $scope.consumers = [];
    $scope.total = null;
    $scope.offset = null;
    $scope.gelato = Kong.config.gelato;

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
}]);
