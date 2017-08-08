define(['worldwind'],
    function(ww) {
        "use strict";
        var WmtUtil = {
            DEG_TO_RAD: Math.PI / 180,
            HOURS_TO_MILLISECS: 1000 * 60 * 60,
            METERS_TO_FEET: 3.28084,
            METERS_TO_MILES: 0.000621371,
            METERS_TO_RADIANS: 1 / WorldWind.EARTH_RADIUS,
            MILLISECS_TO_MINUTES: 1 / (1000 * 60),
            MILLISECS_TO_HOURS: 1 / (1000 * 60 * 60),
            EPSILON_TOLERANCE: 0.0000001,
            currentDomain: function() {
                return window.location.protocol + "//" + window.location.host;
            },
            distanceBetweenLatLons: function(lat1, lon1, lat2, lon2) {
                var angleRad = WorldWind.Location.linearDistance(
                    new WorldWind.Location(lat1, lon1),
                    new WorldWind.Location(lat2, lon2));
                return angleRad * WorldWind.EARTH_RADIUS;
            },
            linearInterpolation: function(value, value1, value2, range1, range2) {
                if (value === value1) {
                    return range1;
                }
                var amount = (value1 - value2) / (value1 - value);
                return ((1 - amount) * range1) + (amount * range2);
            },
            guid: function() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0,
                        v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            },
            minutesBetween: function(time1, time2) {
                return Math.abs(time1.getTime() - time2.getTime()) * this.MILLISECS_TO_MINUTES;
            },
            nearlyEquals2: function(a, b, epsilon) {
                if (a === b) {
                    return true;
                }
                return (Math.abs(a - b) < Math.abs(epsilon || this.EPSILON_TOLERANCE));
            },
            nearlyEquals: function(a, b) {
                if (a === b) {
                    return true;
                }
                var epsilon = this.EPSILON_TOLERANCE * Math.max(Math.abs(a), Math.abs(b));
                return Math.abs(a - b) < epsilon;
            },
            pad: function(num, size) {
                var s = "0000000000" + Math.abs(num);
                return (num < 0 ? '-' : '') + s.substr(s.length - size);
            }
        };
        return WmtUtil;
    }
);