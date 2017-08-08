define([
        'worldwind'
    ],
    function(
        ww) {
        "use strict";
        var SkyBackgroundLayer = function(worldWindow) {

            WorldWind.Layer.call(this, "Sky");

            this.globeCanvas = $(worldWindow.canvas);

            this.MIN_ALT = 100000;
            this.MAX_ALT = 1500000;
            this.SKY_LIGHTNESS_FAR = 30;
            this.SKY_LIGHTNESS_NEAR = 70;
            this.SKY_HUE = 205;
            this.SKY_SATURATION = 47;

        };
        SkyBackgroundLayer.prototype = Object.create(WorldWind.Layer.prototype);

        SkyBackgroundLayer.prototype.doRender = function(dc) {
            var eyePosition = dc.eyePosition;
            if (!eyePosition) {
                return;
            }
            this.globeCanvas.css('background-color', this.getCSSHSL(this.skyColor(eyePosition.altitude)));
        };

        SkyBackgroundLayer.prototype.skyColor = function(altitude) {
            var range = this.MAX_ALT - this.MIN_ALT,
                value = Math.min(Math.max(altitude, this.MIN_ALT), this.MAX_ALT),
                lightness = this.interpolate(this.SKY_LIGHTNESS_NEAR, this.SKY_LIGHTNESS_FAR, range, value);

            return {
                h: this.SKY_HUE,
                s: this.SKY_SATURATION,
                l: lightness
            };
        };


        SkyBackgroundLayer.prototype.interpolate = function(start, end, steps, count) {
            var s = start,
                e = end,
                final = s + (((e - s) / steps) * count);
            return Math.floor(final);
        };


        SkyBackgroundLayer.prototype.getCSSHSL = function(hsl) {
            return 'hsl(' + hsl.h + ',' + hsl.s + '%,' + hsl.l + '%)';
        };

        return SkyBackgroundLayer;
    }
);