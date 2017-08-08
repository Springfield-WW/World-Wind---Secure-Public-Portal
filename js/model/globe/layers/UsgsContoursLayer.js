define([
        'model/Explorer',
        'worldwind'
    ],
    function(
        wmt,
        ww) {
        "use strict";

        var UsgsContoursLayer = function() {
            var cfg = {
                title: "USGS Contour Lines",
                version: "1.3.0",
                service: "https://services.nationalmap.gov/arcgis/services/Contours/MapServer/WMSServer?",
                layerNames: "1,2,4,5,7,8",
                sector: new WorldWind.Sector(18.915561901, 64.8750000000001, -160.544024274, -66.9502505149999),
                levelZeroDelta: new WorldWind.Location(36, 36),
                numLevels: 19,
                format: "image/png",
                size: 512,
                coordinateSystem: "EPSG:4326",
                styleNames: ""
            };

            WorldWind.WmsLayer.call(this, cfg);

            this.urlBuilder.transparent = true;
        };

        UsgsContoursLayer.prototype = Object.create(WorldWind.WmsLayer.prototype);

        return UsgsContoursLayer;
    }
);