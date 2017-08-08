define([
        'model/util/Log',
        'model/util/WmtUtil',
        'worldwind'
    ],
    function(
        Log,
        WmtUtil,
        ww) {
        "use strict";

        var Terrain = function(latitude, longitude, elevation, aspect, slope) {
            this.latitude = latitude;
            this.longitude = longitude;
            this.elevation = elevation;
            this.aspect = aspect;
            this.slope = slope;
        };

        Terrain.ZERO = new Terrain(0, 0, 0, 0, 0);
        Terrain.INVALID = new Terrain(Number.NaN, Number.NaN, Number.NaN, Number.NaN, Number.NaN);

        Terrain.prototype.distanceBetween = function(terrain) {
            return WmtUtil.distanceBetweenLatLons(this.latitude, this.longitude, terrain.latitude, terrain.longitude);
        };
        Terrain.prototype.copy = function(terrain) {
            if (!terrain) {
                throw new WorldWind.ArgumentError(
                    Log.error("Terrain", "copy", "missingTerrain"));
            }

            this.latitude = terrain.latitude;
            this.longitude = terrain.longitude;
            this.elevation = terrain.elevation;
            this.aspect = terrain.aspect;
            this.slope = terrain.slope;

            return this;
        };

        Terrain.prototype.equals = function(terrain) {
            return terrain &&
                terrain.latitude === this.latitude &&
                terrain.longitude === this.longitude &&
                terrain.elevation === this.elevation &&
                terrain.aspect === this.aspect &&
                terrain.slope === this.slope;
        };


        Terrain.prototype.toString = function() {
            return "(" + this.latitude.toString() + "\u00b0, " +
                this.longitude.toString() + "\u00b0, " +
                this.elevation.toString() + "m, " +
                this.aspect.toString() + "\u00b0, " +
                this.slope.toString() + "\u00b0)";
        };

        return Terrain;
    }
);