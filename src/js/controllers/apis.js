angular.module('app').controller("ApisController", ["$scope", "Kong", function ($scope, Kong) {
    $scope.apis = [];
    $scope.total = null;
    $scope.offset = null;

    var loaded_pages = [];
    $scope.loadMore = function() {
        var page = '/apis?';
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
            $scope.apis.push.apply($scope.apis, collection.data);
            $scope.total += collection.total;
            $scope.offset = collection.offset ? collection.offset : null;
        });
    };
    $scope.loadMore();

    $scope.showDeleteModal = function (name, id) {
        $scope.current = {name: name, id: id};
        $('#deleteAPI').openModal();
    };

    $scope.abortDelete = function () {
        $('#deleteAPI').closeModal();
    };

    $scope.performDelete = function () {
        $('#deleteAPI').closeModal();
        Kong.delete('/apis/' + $scope.current.id).then(function () {
            $scope.total -= 1;
            $scope.apis.forEach(function(element, index) {
                if (element.id === $scope.current.id) {
                    $scope.apis.splice(index, 1);
                }
            });
        });
    }
}]);

