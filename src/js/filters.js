/**
 * If myVar is "hello_world", {{ myVar | underscoreToWords }} will output "Hello world".
 */
angular.module('app').filter('underscoresToWords', function () {
    return function (input) {
        if (!input) {
            return null;
        }
        input = input.toLowerCase();
        var human_readable = input.split('_').reduce(function (previous, current) {
            return previous + current + ' ';
        }, "");
        return human_readable.substring(0, 1).toUpperCase() + human_readable.substring(1);
    }
});

angular.module('app').filter('firstLetterUp', function() {
   return function (input) {
       input = input.toLowerCase();
       return input.substring(0, 1).toUpperCase() + input.substring(1);
   }
});

/**
 * If my Var is ["One", "Two"], {{ myVar | arrayToHtmlList}} will output "<ul><li>One</li><li>Two</li></ul>"
 */
angular.module('app').filter('arrayToHtmlList', ['$sce', function($sce) {
    return function(input) {
        var output = '';
        if (angular.isString(input)) {
            output += input;
        }
        if (angular.isArray(input)) {
            angular.forEach(input, function(elt) {
                output += '<li>' + elt + '</li>';
            });
            output = '<ul>' + output + '</ul>';
        }
        return $sce.trustAsHtml(output); // prevent angular from escaping html.
    }
}]);

/**
 * If my Var is ["one", "two"], {{ myVar | arrayToList}} will output "one,two"
 */
angular.module('app').filter('arrayToList', function() {
    return function(input) {
        if (angular.isString(input)) {
            return input;
        }
        if (angular.isArray(input)) {
            return input.join();
        }
    }
});
