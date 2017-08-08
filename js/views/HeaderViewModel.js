define(['knockout'],
    function(ko) {
        "use strict";

        function OutputViewModel() {
            var self = this;
            self.appName = ko.observable("World Wind Explorer");
        }

        return OutputViewModel;
    }
);