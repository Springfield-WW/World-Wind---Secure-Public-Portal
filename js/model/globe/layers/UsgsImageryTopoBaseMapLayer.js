define([
        'model/Explorer',
        'worldwind'
    ],
    function(
        wmt,
        ww) {
        "use strict";

        var UsgsImageryTopoBaseMapLayer = function() {
            var cfg = {
                title: "USGS Imagery Topo Basemap",
                version: "1.3.0",
                service: "https://basemap.nationalmap.gov/arcgis/services/USGSImageryTopo/MapServer/WmsServer?",
                layerNames: "0",
                sector: new WorldWind.Sector(-90.0, 90.0, -180, 180),
                levelZeroDelta: new WorldWind.Location(36, 36),
                numLevels: 12,
                format: "image/png",
                size: 512,
                coordinateSystem: "EPSG:4326",
                styleNames: ""
            };

            WorldWind.WmsLayer.call(this, cfg);

            this.opacity = 1.0;

            this.urlBuilder.transparent = false;
        };

        UsgsImageryTopoBaseMapLayer.prototype = Object.create(WorldWind.WmsLayer.prototype);

        return UsgsImageryTopoBaseMapLayer;
    }
);