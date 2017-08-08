define(['jquery',
        'knockout',
        'model/Constants',
        'model/util/Log',
        'model/markers/MarkerManager',
        'model/util/Settings',
        'worldwind'
    ],
    function($,
        ko,
        constants,
        log,
        MarkerManager,
        settings) {
        "use strict";
        var Explorer = {
            VERSION: "0.1.0",
            initialize: function(globe) {
                var self = this;

                this.globe = globe;
                this.wwd = globe.wwd;
                this.markerManager = new MarkerManager(globe);

                this.goToAnimator = new WorldWind.GoToAnimator(this.wwd);
                this.isAnimating = false;

                this.updateTimeout = null;
                this.updateInterval = 50;

                this.wwd.redrawCallbacks.push(function() {
                    self.handleRedraw();
                });

                this.autoUpdateTimeEnabled = ko.observable(true);
                this.dateTimeInterval = window.setInterval(function() {
                    if (self.autoUpdateTimeEnabled()) {
                        self.globe.updateDateTime(new Date());
                    }
                }, 30000);

                window.addEventListener("mousemove", function(event) {
                    self.handleMouseEvent(event);
                });
                window.addEventListener("touchstart", function(event) {
                    self.handleTouchEvent(event);
                });

            },

            identifyFeaturesAtLatLon: function(latitude, longitude, params) {
                var arg = params || {};

                if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
                    log.error("Explorer", "identifyFeaturesAtLatLon", "Invalid Latitude and/or Longitude.");
                    return;
                }

            },
            lookAtLatLon: function(latitude, longitude, eyeAltitude) {
                if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
                    log.error("Explorer", "lookAtLatLon", "Invalid Latitude and/or Longitude.");
                    return;
                }
                var self = this,
                    eyeAltMsl = this.globe.viewpoint().eye.altitude,
                    eyePosGrdElev = this.globe.terrainProvider.elevationAtLatLon(this.globe.viewpoint().eye.latitude, this.globe.viewpoint().eye.longitude),
                    tgtPosElev = this.globe.terrainProvider.elevationAtLatLon(latitude, longitude),
                    eyeAltAgl = eyeAltitude || Math.max(eyeAltMsl - eyePosGrdElev, 100),
                    tgtEyeAltMsl = Math.max(tgtPosElev + eyeAltAgl, 100);

                this.wwd.navigator.range = eyeAltMsl;
                this.wwd.navigator.tilt = 0;
                this.wwd.redraw();

                this.globe.goto(latitude, longitude, tgtEyeAltMsl, function() {
                    self.updateSpatialData();
                });
            },
            getTargetTerrain: function() {
                return this.globe.viewpoint().target;
            },
            restoreSession: function() {
                log.info('Explorer', 'restoreSession', 'Restoring the model and view.');
                this.markerManager.restoreMarkers();
                this.restoreSessionView();
                this.globe.updateDateTime(new Date());

                this.globe.redraw();
            },
            restoreSessionView: function() {
                settings.restoreSessionSettings(this);
            },
            saveSession: function() {
                log.info('Explorer', 'saveSession', 'Saving the model and view.');
                this.saveSessionView();
                this.markerManager.saveMarkers();
            },
            saveSessionView: function() {
                settings.saveSessionSettings(this);
            },
            updateSpatialData: function() {
                var wwd = this.wwd,
                    mousePoint = this.mousePoint,
                    centerPoint = new WorldWind.Vec2(wwd.canvas.width / 2, wwd.canvas.height / 2);

                if (!mousePoint) {
                    this.globe.updateMousePosition(centerPoint);
                } else if (wwd.viewport.containsPoint(mousePoint)) {
                    this.globe.updateMousePosition(mousePoint);
                }
                if (!this.isAnimating) {
                    this.globe.updateEyePosition();
                }
            },
            handleRedraw: function() {
                var self = this;
                if (self.updateTimeout) {
                    return;
                }
                self.updateTimeout = window.setTimeout(function() {
                    self.updateSpatialData();
                    self.updateTimeout = null;
                }, self.updateInterval);
            },
            handleMouseEvent: function(event) {
                if (this.isTouchDevice) {
                    return;
                }
                this.mousePoint = this.wwd.canvasCoordinates(event.clientX, event.clientY);
                this.wwd.redraw();
            },
            handleTouchEvent: function() {
                this.isTouchDevice = true;
                this.mousePoint = null;
            }
        };
        Explorer.configuration = {
            imageryDetailHint: (window.screen.width < 768 ? -0.1 : (window.screen.width < 1024 ? 0.0 : (window.screen.width < 1280 ? 0.1 : 0.2))),
            markerLabels: constants.MARKER_LABEL_NAME,
            startupLatitude: 34.29,
            startupLongitude: -119.29,
            startupAltitude: 1000000,
            startupHeading: 0,
            startupTilt: 0,
            startupRoll: 0,
            showPanControl: true,
            showExaggerationControl: true,
            showFieldOfViewControl: false,
            terrainSampleRadius: 30,
            viewControlOrientation: "vertical"
        };

        return Explorer;
    }
);