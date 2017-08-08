define(['jquery',
        'model/Constants',
        'model/util/Log',
        'model/util/Settings',
        'worldwind'
    ],
    function($,
        constants,
        log,
        settings) {
        "use strict";
        var Config = {
            imageryDetailHint: (window.screen.width < 768 ? -0.1 : (window.screen.width < 1024 ? 0.0 : (window.screen.width < 1280 ? 0.1 : 0.2))),
            markerLabels: "Marker",
            startupLatitude: 34.29,
            startupLongitude: -119.29,
            startupAltitude: 1000000,
            startupHeading: 0,
            startupTilt: 0,
            startupRoll: 0,
            showPanControl: false,
            showExaggerationControl: true,
            showFieldOfViewControl: false,
            terrainSampleRadius: 30
        };

        return Config;
    }
);