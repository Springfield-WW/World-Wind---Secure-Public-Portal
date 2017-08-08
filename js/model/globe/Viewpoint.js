define([
        'model/util/Log',
        'model/globe/Terrain',
        'worldwind'
    ],
    function(
        log,
        Terrain,
        ww) {
        "use strict";

        var Viewpoint = function(eyePosition, targetTerrain) {
            if (!eyePosition) {
                throw new WorldWind.ArgumentError(
                    log.error("Viewpoint", "constructor", "missingPosition"));
            }
            if (!targetTerrain) {
                throw new WorldWind.ArgumentError(
                    log.error("Viewpoint", "constructor", "missingTerrain"));
            }
            this.eye = new WorldWind.Position(eyePosition.latitude, eyePosition.longitude, eyePosition.altitude);
            this.target = new Terrain();
            this.target.copy(targetTerrain);
        };

        Viewpoint.INVALID = new Viewpoint(
            new WorldWind.Position(Number.NaN, Number.NaN, Number.NaN),
            Terrain.INVALID);

        Viewpoint.ZERO = new Viewpoint(WorldWind.Position.ZERO, Terrain.ZERO);

        Viewpoint.prototype.copy = function(viewpoint) {
            if (!viewpoint) {
                throw new WorldWind.ArgumentError(
                    log.error("Viewpoint", "copy", "missingViewpoint"));
            }
            this.eye.copy(viewpoint.eye);
            this.target.copy(viewpoint.target);

            return this;
        };

        Viewpoint.prototype.equals = function(viewpoint) {
            return viewpoint &&
                viewpoint.eye.equals(this.eye) &&
                viewpoint.target.equals(this.target);
        };


        Viewpoint.prototype.toString = function() {
            return "(" +
                this.eye.latitude.toString() + "\u00b0, " +
                this.eye.longitude.toString() + "\u00b0, " +
                this.eye.altitude.toString() + "m, " +
                this.target.latitude.toString() + "\u00b0, " +
                this.target.longitude.toString() + "\u00b0, " +
                this.target.elevation.toString() + "m, " +
                this.target.aspect.toString() + "\u00b0, " +
                this.target.slope.toString() + "\u00b0)";
        };

        return Viewpoint;
    }
);