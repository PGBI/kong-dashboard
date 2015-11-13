angular.module('app').factory('Alert', function() {
    return {
        success: function(msg) {
            var html = "<i class='material-icons'>done</i>&nbsp;&nbsp;&nbsp;<strong>" + msg + "</strong>";
            Materialize.toast(html, 4000, 'teal lighten-2');
        },
        error: function(msg) {
            var html = "<i class='material-icons'>error</i>&nbsp;&nbsp;&nbsp;<strong>" + msg + "</strong>";
            Materialize.toast(html, 4000, 'red darken-4');
        }
    }
});
