define(['model/Config',
        'model/util/Log'
    ],
    function(config,
        log) {
        "use strict";
        var Settings = {
            STARTUP_LATITUDE_KEY: "startupLatitude",
            STARTUP_LONGITUDE_KEY: "startupLongitude",
            STARTUP_ALTITUDE_KEY: "startupAltitude",
            STARTUP_ROLL_KEY: "startupRoll",
            STARTUP_TILT_KEY: "startupTilt",
            STARTUP_HEADING_KEY: "startupHeading",
            saveSessionSettings: function(explorer) {
                if (!window.localStorage) {
                    log.warning("Settings", "saveSessionSettings", "Local Storage is not supported!");
                    return;
                }

                var target = explorer.getTargetTerrain(),
                    pos = new WorldWind.Location(target.latitude, target.longitude),
                    alt = explorer.wwd.navigator.range,
                    heading = explorer.wwd.navigator.heading,
                    tilt = explorer.wwd.navigator.tilt,
                    roll = explorer.wwd.navigator.roll;

                localStorage.setItem(this.STARTUP_LATITUDE_KEY, pos.latitude);
                localStorage.setItem(this.STARTUP_LONGITUDE_KEY, pos.longitude);
                localStorage.setItem(this.STARTUP_ALTITUDE_KEY, alt);

                localStorage.setItem(this.STARTUP_HEADING_KEY, heading);
                localStorage.setItem(this.STARTUP_TILT_KEY, tilt);
                localStorage.setItem(this.STARTUP_ROLL_KEY, roll);

            },
            restoreSessionSettings: function(explorer) {
                try {
                    if (!localStorage) {
                        log.warning("Settings", "restoreSessionSettings", "Local Storage is not enabled!");
                        return;
                    }
                    var lat = Number(localStorage.getItem(this.STARTUP_LATITUDE_KEY)),
                        lon = Number(localStorage.getItem(this.STARTUP_LONGITUDE_KEY)),
                        alt = Number(localStorage.getItem(this.STARTUP_ALTITUDE_KEY)),
                        head = Number(localStorage.getItem(this.STARTUP_HEADING_KEY)),
                        tilt = Number(localStorage.getItem(this.STARTUP_TILT_KEY)),
                        roll = Number(localStorage.getItem(this.STARTUP_ROLL_KEY));

                    if (isNaN(lat) || isNaN(lon)) {
                        log.warning("Settings", "restoreSessionSettings", "Previous state invalid: Using default lat/lon.");
                        lat = config.startupLatitude;
                        lon = config.startupLongitude;
                    }
                    if (isNaN(alt)) {
                        log.warning("Settings", "restoreSessionSettings", "Previous state invalid: Using default altitude.");
                        alt = config.startupAltitude;
                    }
                    if (isNaN(head) || isNaN(tilt) || isNaN(roll)) {
                        log.warning("Settings", "restoreSessionSettings", "Previous state invalid: Using default view angles.");
                        head = config.startupHeading;
                        tilt = config.startupTilt;
                        roll = config.startupRoll;
                    }



                } catch (e) {
                    log.error("Settings", "restoreSessionSettings",
                        "Exception occurred processing cookie: " + e.toString());
                }
            }
        };

        return Settings;
    }
);