define([
        'knockout',
        'model/util/Log',
        'model/sun/SolarCalculator'
    ],
    function(ko,
        log,
        SolarCalculator) {
        "use strict";
        var SolarModel = function(time, location) {

            var solarCalculator = new SolarCalculator();
            this.sunlight = ko.pureComputed(function() {
                return solarCalculator.calculate(
                    time(), -(time().getTimezoneOffset() / 60),
                    location().latitude,
                    location().longitude);
            });
        };

        return SolarModel;
    }
);