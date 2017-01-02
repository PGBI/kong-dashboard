angular.module('app').controller("ApisController", ["initialData", "$scope", "Kong", "$route", function (initialData, $scope, Kong, $route) {
    $scope.apis = initialData.data;
    $scope.total = initialData.total;
    $scope.next = initialData.next;
    $scope.size = $route.current.params.size;
    $scope.offset = initialData.next ? /offset=([^&]+)/.exec(initialData.next)[1] : null;
    
    $scope.showDeleteModal = function (name, id) {
        $scope.current = {name: name, id: id};
        $('#deleteAPI').openModal();
    };
    $scope.abortDelete = function () {
        $('#deleteAPI').closeModal();
    };
    $scope.performDelete = function () {
        $('#deleteAPI').closeModal();
        Kong.delete('/apis/' + $scope.current.id).then(function (response) {
            $route.reload();
        });
    }
}]);

