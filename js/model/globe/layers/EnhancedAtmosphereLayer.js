define(['worldwind'],
    function(ww) {
        "use strict";
        var EnhancedAtmosphereLayer = function(globe, url) {
            var self = this;
            WorldWind.AtmosphereLayer.call(this, url);

            this.displayName = "Atmosphere & Day/Night";

            globe.sunlight.subscribe(function(sunlight) {
                self.lightLocation = new WorldWind.Position(sunlight.subsolarLatitude, sunlight.subsolarLongitude, 1.5e11);
            });
        };
        EnhancedAtmosphereLayer.prototype = Object.create(WorldWind.AtmosphereLayer.prototype);

        return EnhancedAtmosphereLayer;
    }
);