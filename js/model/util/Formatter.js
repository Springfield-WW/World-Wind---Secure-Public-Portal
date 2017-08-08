define([
        'model/util/WmtUtil', 'worldwind'
    ],
    function(
        util,
        ww) {
        "use strict";
        var Formatter = {
            formatDecimalDegrees: function(number, decimals) {
                return number.toFixed(decimals) + "\u00b0";
            },
            formatDecimalMinutes: function(number, decimals) {
                var degrees = Math.floor(number) + (number < 0 ? 1 : 0),
                    minutes = WorldWind.WWMath.fabs(number - degrees) * 60;

                return degrees + "\u00b0" + minutes.toFixed(decimals) + "\'";
            },
            formatDegreesMinutesSeconds: function(number, decimals) {
                var degrees = Math.floor(number) + (number < 0 ? 1 : 0),
                    minutesNum = WorldWind.WWMath.fabs(number - degrees) * 60,
                    minutesInt = Math.floor(minutesNum),
                    seconds = WorldWind.WWMath.fabs(minutesNum - minutesInt) * 60;

                return degrees + "\u00b0" + minutesInt + "\'" + seconds.toFixed(decimals) + "\"";
            },
            formatDecimalDegreesLat: function(latitude, decimals) {
                var number = WorldWind.WWMath.fabs(latitude);
                return this.formatDecimalDegrees(number, decimals) + (latitude >= 0 ? "N" : "S");
            },
            formatDecimalDegreesLon: function(longitude, decimals) {
                var number = WorldWind.WWMath.fabs(longitude);
                return this.formatDecimalDegrees(number, decimals) + (longitude >= 0 ? "E" : "W");
            },
            formatDecimalMinutesLat: function(latitude, decimals) {
                var number = WorldWind.WWMath.fabs(latitude);
                return this.formatDecimalMinutes(number, decimals) + (latitude >= 0 ? "N" : "S");
            },
            formatDecimalMinutesLon: function(longitude, decimals) {
                var number = WorldWind.WWMath.fabs(longitude);
                return this.formatDecimalMinutes(number, decimals) + (longitude >= 0 ? "E" : "W");
            },
            formatDMSLatitude: function(latitude, decimals) {
                var number = WorldWind.WWMath.fabs(latitude);
                return this.formatDegreesMinutesSeconds(number, decimals) + (latitude >= 0 ? "N" : "S");
            },
            formatDMSLongitude: function(longitude, decimals) {
                var number = WorldWind.WWMath.fabs(longitude);
                return this.formatDegreesMinutesSeconds(number, decimals) + (longitude >= 0 ? "E" : "W");
            },
            formatAngle360: function(angle, decimals) {
                while (angle < 0) {
                    angle += 360;
                }
                while (angle >= 360) {
                    angle -= 360;
                }
                return angle.toFixed(decimals) + "\u00b0";
            },
            formatAngle180: function(angle, decimals) {
                while (angle > 180) {
                    angle -= 360;
                }
                while (angle < -180) {
                    angle += 360;
                }
                return angle.toFixed(decimals) + "\u00b0";
            },
            formatAltitude: function(altitude, units) {
                if (units === "km") {
                    altitude /= 1e3;
                }
                return altitude.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + units;

            },
            formatDayOfMonthTime: function(datetime, locale) {
                var timeOptions = {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                    },
                    dateOptions = {
                        day: "2-digit"
                    };

                return datetime.toLocaleDateString(locale || 'en', dateOptions) +
                    ' ' + datetime.toLocaleTimeString(locale || 'en', timeOptions);
            },
            formatPercentSlope: function(angle, decimals) {
                while (angle < 0) {
                    angle += 360;
                }
                while (angle >= 360) {
                    angle -= 360;
                }
                var percent = Math.tan(angle * util.DEG_TO_RAD) * 100;
                return percent.toFixed(decimals) + "%";
            },

        };
        return Formatter;
    }
);