define(['model/Constants',
        'model/globe/layers/ShapefileLayer',
        'worldwind'
    ],
    function(constants,
        ShapefileLayer,
        ww) {
        "use strict";
        var TimeZoneLayer = function() {
            var shapeConfigurationCallback = function(attributes, record) {
                var configuration = {};
                configuration.name = attributes.values.name || attributes.values.Name || attributes.values.NAME;
                configuration.attributes = new WorldWind.ShapeAttributes(null);
                configuration.attributes.interiorColor = new WorldWind.Color(
                    0.375 + 0.5 * Math.random(),
                    0.375 + 0.5 * Math.random(),
                    0.375 + 0.5 * Math.random(),
                    0.0);

                configuration.attributes.drawOutline = false;

                configuration.userProperties = {
                    record: attributes,
                    layer: record.shapefile.layer
                };

                return configuration;
            };

            this._enabled = true;

            ShapefileLayer.call(this,
                ww.WWUtil.currentUrlSansFilePart() + "/data/timezones/ne_05deg_time_zones.shp",
                constants.LAYER_NAME_TIME_ZONES,
                shapeConfigurationCallback);
        };

        TimeZoneLayer.prototype = Object.create(ShapefileLayer.prototype);

        return TimeZoneLayer;
    }
);