define(['knockout',
        'jquery',
        'model/Constants'
    ],
    function(ko, $, constants) {
        function ProjectionsViewModel(globe) {
            var self = this;

            self.projections = ko.observableArray([
                constants.PROJECTION_NAME_3D,
                constants.PROJECTION_NAME_EQ_RECT,
                constants.PROJECTION_NAME_MERCATOR,
                constants.PROJECTION_NAME_NORTH_POLAR,
                constants.PROJECTION_NAME_SOUTH_POLAR,
                constants.PROJECTION_NAME_NORTH_UPS,
                constants.PROJECTION_NAME_SOUTH_UPS,
                constants.PROJECTION_NAME_NORTH_GNOMONIC,
                constants.PROJECTION_NAME_SOUTH_GNOMONIC
            ]);

            self.currentProjection = ko.observable('3D');
            self.changeProjection = function(projectionName) {
                self.currentProjection(projectionName);
                globe.setProjection(projectionName);
            };
        }

        return ProjectionsViewModel;
    }
);