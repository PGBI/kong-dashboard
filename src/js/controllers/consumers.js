angular.module('app').controller("ConsumersController", ["consumersCollection", "$scope", "Kong", "$route", function (consumersCollection, $scope, Kong, $route) {
    $scope.consumers = consumersCollection.data;
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
            $route.reload();
        });
    }
}]);

