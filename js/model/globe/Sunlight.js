define([
        'model/util/Log',
        'model/sun/SolarCalculator',
        'worldwind'
    ],
    function(
        log,
        SolarCalculator,
        ww) {
        "use strict";

        var Sunlight = function(time, observerLatitiude, observerLongitude) {
            var sun = Sunlight.solarCalculator.calculate(
                time, -(time.getTimezoneOffset() / 60),
                observerLatitiude, observerLongitude);
            this.sunriseTime = sun.sunrise;
            this.sunsetTime = sun.sunset;
            this.azimuthAngle = sun.azimuth;
            this.localHourAngle = sun.hourAngle;
            this.sunriseHourAngle = sun.sunriseHourAngle;
            this.sunsetHourAngle = sun.sunsetHourAngle;
            this.subsolarLatitude = sun.subsolarLatitude;
            this.subsolarLongitude = sun.subsolarLongitude;
        };

        Sunlight.prototype.toString = function() {
            return "(" + this.sunriseTime.toString() + ", " +
                this.sunsetTime.toString() + " " +
                this.azimuthAngle.toString() + "\u00b0, " +
                this.localHourAngle.toString() + "\u00b0, " +
                this.sunriseHourAngle.toString() + "\u00b0, " +
                this.sunsetHourAngle.toString() + "\u00b0, " +
                this.subsolarLatitude.toString() + "\u00b0, " +
                this.subsolarLatitude.toString() + "\u00b0)";
        };

        Sunlight.solarCalculator = new SolarCalculator();

        return Sunlight;
    }
);