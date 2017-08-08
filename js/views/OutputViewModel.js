define(['knockout',
        'jquery',
        'model/Constants'
    ],
    function(ko, $, constants) {

        function OutputViewModel(globe) {
            var self = this;

            this.globe = globe;
            this.selectedItem = this.globe.selectController.lastSelectedItem;
            this.viewTemplateName = ko.observable(null);
            this.selectedItem.subscribe(function(newItem) {
                if (newItem !== null) {
                    if (typeof newItem.viewTemplateName !== "undefined") {
                        self.viewTemplateName(newItem.viewTemplateName);
                    } else {
                        self.viewTemplateName(null);
                    }
                }
            });
        }

        return OutputViewModel;
    }
);