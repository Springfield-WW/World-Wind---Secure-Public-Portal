define(['knockout', 'jquery', 'jqueryui'],
    function(ko, $) {
        "use strict";

        function MarkerEditor() {
            var self = this;
            self.marker = ko.observable({});

            self.open = function(marker) {
                console.log("Open Marker: " + marker.name());
                self.marker(marker);

                var $markerEditor = $("#marker-editor");
                $markerEditor.dialog({
                    autoOpen: false,
                    title: "Edit Marker"
                });
                $markerEditor.dialog("open");
            };

        }

        return MarkerEditor;
    }
);