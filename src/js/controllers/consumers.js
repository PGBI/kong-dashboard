angular.module('app').controller("ConsumersController", ["consumersCollection", "$scope", "Kong", "$route", function (consumersCollection, $scope, Kong, $route) {
    $scope.consumers = consumersCollection.data;
    $scope.total = consumersCollection.total; 
    $scope.next = consumersCollection.next;
    $scope.size = $route.current.params.size;
    $scope.offset = consumersCollection.next ? /offset=([^&]+)/.exec(consumersCollection.next)[1] : null;
    //$scope.offset = encodeURIComponent(consumersCollection.offset);
    $scope.gelato = Kong.config.gelato;
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
