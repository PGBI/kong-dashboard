angular.module('app').directive("materializeSelect", ["$compile", "$timeout", function ($compile, $timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            function initSelect() {
                element.siblings(".caret").remove();
                element.material_select();
                // fixing dropdown height to not go past window bottom.
                $input_select = $(element).parent().children('input.select-dropdown');
                $input_select.on('focus', function () {
                    var $new_select = $(element).parent().children('ul');
                    $new_select.css('top', '0');
                    $new_select.css('maxHeight', $(document).height() - $new_select.offset().top);
                })
            }
            $timeout(initSelect);
            if (attrs.ngModel && !attrs.multiple) {
                scope.$watch(attrs.ngModel, initSelect);
            }
        }
    };
}]);
