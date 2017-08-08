define(['knockout',
        'model/Config',
        'model/Constants',
        'model/Events',
        'model/globe/layers/EnhancedAtmosphereLayer',
        'model/globe/EnhancedTextSupport',
        'model/globe/layers/EnhancedViewControlsLayer',
        'model/globe/KeyboardControls',
        'model/globe/LayerManager',
        'model/globe/widgets/LocationWidget',
        'model/util/Log',
        'model/util/Publisher',
        'model/globe/layers/ReticuleLayer',
        'model/globe/SelectController',
        'model/globe/layers/SkyBackgroundLayer',
        'model/globe/Sunlight',
        'model/globe/Terrain',
        'model/globe/TerrainProvider',
        'model/globe/widgets/TimeWidget',
        'model/globe/layers/TimeZoneLayer',
        'model/globe/Viewpoint',
        'model/util/WmtUtil',
        'worldwind'
    ],
    function(ko,
        config,
        constants,
        events,
        EnhancedAtmosphereLayer,
        EnhancedTextSupport,
        EnhancedViewControlsLayer,
        KeyboardControls,
        LayerManager,
        LocationWidget,
        log,
        publisher,
        ReticuleLayer,
        SelectController,
        SkyBackgroundLayer,
        Sunlight,
        Terrain,
        TerrainProvider,
        TimeWidget,
        TimeZoneLayer,
        Viewpoint,
        util,
        ww) {
        "use strict";
        var Globe = function(wwd, options) {
            publisher.makePublisher(this);

            this.wwd = wwd;

            this.enhanceLookAtNavigator(wwd.navigator);

            this.use24Time = ko.observable(false);
            this.timeZoneDetectEnabled = ko.observable(true);
            this.timeZoneOffsetHours = ko.observable(0);
            this.timeZoneName = ko.observable("UTC");
            this.dateTime = ko.observable(new Date(0));
            this.viewpoint = ko.observable(Viewpoint.ZERO).extend({
                rateLimit: 100
            });
            this.terrainAtMouse = ko.observable(Terrain.ZERO);
            this.sunlight = ko.observable(new Sunlight(
                this.dateTime(),
                this.viewpoint().target.latitude,
                this.viewpoint().target.longitude)).extend({
                rateLimit: 100
            });

            this.wwd.drawContext.textSupport = new EnhancedTextSupport();
            this.goToAnimator = new WorldWind.GoToAnimator(this.wwd);
            this.isAnimating = false;
            this.selectController = new SelectController(this.wwd);
            this.keyboardControls = new KeyboardControls(this);
            this.layerManager = new LayerManager(this);
            this.resizeTimer = null;
            this.canvasWidth = null;
            this.terrainProvider = new TerrainProvider(this);


            var self = this,
                showBackground = options ? options.showBackground : true,
                showReticule = options ? options.showReticule : true,
                showViewControls = options ? options.showViewControls : true,
                showWidgets = options ? options.showWidgets : true,
                includePanControls = options ? options.includePanControls : true,
                includeRotateControls = options ? options.includeRotateControls : true,
                includeTiltControls = options ? options.includeTiltControls : true,
                includeZoomControls = options ? options.includeZoomControls : true,
                includeExaggerationControls = options ? options.includeExaggerationControls : true,
                includeFieldOfViewControls = options ? options.includeFieldOfViewControls : false,
                controls,
                widgets;

            if (showBackground || showBackground === undefined) {
                this.timeZoneLayer = new TimeZoneLayer();
                this.layerManager.addOverlayLayer(this.timeZoneLayer, {
                    enabled: true,
                    pickEnabled: true
                });
                this.layerManager.addEffectLayer(new EnhancedAtmosphereLayer(this));
            }




            if (showReticule || showReticule === undefined) {
                this.layerManager.addWidgetLayer(new ReticuleLayer());
            }


            if (showViewControls || showViewControls === undefined) {
                controls = new EnhancedViewControlsLayer(this.wwd);
                controls.showPanControl = includePanControls;
                controls.showHeadingControl = includeRotateControls;
                controls.showTiltControl = includeTiltControls;
                controls.showZoomControl = includeZoomControls;
                controls.showExaggerationControl = includeExaggerationControls;
                controls.showFieldOfViewControl = includeFieldOfViewControls;
                this.layerManager.addWidgetLayer(controls);
            }


            if (showWidgets || showWidgets === undefined) {
                widgets = new WorldWind.RenderableLayer(constants.LAYER_NAME_WIDGETS);
                widgets.addRenderable(new TimeWidget(this));
                widgets.addRenderable(new LocationWidget(this));
                this.layerManager.addWidgetLayer(widgets);
            }

            $(window).resize(function() {
                self.wwd.redraw();

            });

            this.wwd.addEventListener("click", function(event) {
                self.setFocus();
            });

            this.lastEyePoint = new WorldWind.Vec3();
            this.lastViewpoint = new Viewpoint(WorldWind.Position.ZERO, Terrain.ZERO);
            this.lastMousePoint = new WorldWind.Vec2();
            this.lastSolarTarget = new Terrain(0, 0, 0, 0, 0);
            this.lastSolarTime = new Date(0);
            this.SUNLIGHT_DISTANCE_THRESHOLD = 10000;
            this.SUNLIGHT_TIME_THRESHOLD = 15;

            this.updateDateTime(new Date());

            this.viewpoint.subscribe(function() {
                if (this.timeZoneDetectEnabled()) {
                    this.updateTimeZoneOffset();
                }
            }, this);
        };

        Globe.prototype.enhanceLookAtNavigator = function(navigator) {

            navigator.lastEyePosition = new WorldWind.Position();
            navigator.lastLookAtLocation = new WorldWind.Location(navigator.lookAtLocation.latitude, navigator.lookAtLocation.longitude);
            navigator.lastRange = navigator.range;
            navigator.lastHeading = navigator.heading;
            navigator.lastTilt = navigator.tilt;
            navigator.lastRoll = navigator.roll;

            navigator.terrainInterceptPosition = function() {
                var wwd = navigator.worldWindow,
                    centerPoint = new WorldWind.Vec2(wwd.canvas.width / 2, wwd.canvas.height / 2),
                    terrainObject = wwd.pickTerrain(centerPoint).terrainObject();

                if (terrainObject) {
                    return terrainObject.position;
                }
            };
            navigator.applyLimits = function() {
                if (isNaN(navigator.lookAtLocation.latitude) || isNaN(navigator.lookAtLocation.longitude)) {
                    log.error("EnhancedLookAtNavigator", "applyLimits", "Invalid lat/lon: NaN");
                    navigator.lookAtLocation.latitude = navigator.lastLookAtLocation.latitude;
                    navigator.lookAtLocation.longitude = navigator.lastLookAtLocation.longitude;
                }
                if (isNaN(navigator.range)) {
                    log.error("EnhancedLookAtNavigator", "applyLimits", "Invalid range: NaN");
                    navigator.range = isNaN(navigator.lastRange) ? 1000 : navigator.lastRange;
                }
                if (navigator.range < 0) {
                    log.error("EnhancedLookAtNavigator", "applyLimits", "Invalid range: < 0");
                    navigator.range = 1;
                }
                if (isNaN(navigator.heading)) {
                    log.error("EnhancedLookAtNavigator", "applyLimits", "Invalid heading: NaN");
                    navigator.heading = navigator.lastHeading;
                }
                if (isNaN(navigator.tilt)) {
                    log.error("EnhancedLookAtNavigator", "applyLimits", "Invalid tilt: NaN");
                    navigator.tilt = navigator.lastTilt;
                }

                if (!navigator.validateEyePosition()) {
                    navigator.lookAtLocation.latitude = navigator.lastLookAtLocation.latitude;
                    navigator.lookAtLocation.longitude = navigator.lastLookAtLocation.longitude;
                    navigator.range = navigator.lastRange;
                    navigator.heading = navigator.lastHeading;
                    navigator.tilt = navigator.lastTilt;
                    navigator.roll = navigator.lastRoll;
                }
                navigator.lookAtLocation.latitude = WorldWind.WWMath.clamp(navigator.lookAtLocation.latitude, -90, 90);
                navigator.lookAtLocation.longitude = WorldWind.Angle.normalizedDegreesLongitude(navigator.lookAtLocation.longitude);
                navigator.range = WorldWind.WWMath.clamp(navigator.range, 1, constants.NAVIGATOR_MAX_RANGE);
                navigator.heading = WorldWind.Angle.normalizedDegrees(navigator.heading);
                navigator.tilt = WorldWind.WWMath.clamp(navigator.tilt, 0, 90);
                navigator.roll = WorldWind.Angle.normalizedDegrees(navigator.roll);
                if (navigator.worldWindow.globe.is2D() && navigator.enable2DLimits) {
                    var nearDist = navigator.nearDistance,
                        nearWidth = WorldWind.WWMath.perspectiveFrustumRectangle(navigator.worldWindow.viewport, nearDist).width,
                        maxRange = 2 * Math.PI * navigator.worldWindow.globe.equatorialRadius * (nearDist / nearWidth);
                    navigator.range = WorldWind.WWMath.clamp(navigator.range, 1, maxRange);

                    navigator.tilt = 0;
                }
                navigator.lastLookAtLocation.latitude = navigator.lookAtLocation.latitude;
                navigator.lastLookAtLocation.longitude = navigator.lookAtLocation.longitude;
                navigator.lastRange = navigator.range;
                navigator.lastHeading = navigator.heading;
                navigator.lastTilt = navigator.tilt;
                navigator.lastRoll = navigator.roll;
            };
            navigator.validateEyePosition = function() {
                var wwd = navigator.worldWindow,
                    navigatorState = navigator.intermediateState(),
                    eyePoint = navigatorState.eyePoint,
                    eyePos = new WorldWind.Position(),
                    terrainElev;

                wwd.globe.computePositionFromPoint(eyePoint[0], eyePoint[1], eyePoint[2], eyePos);
                if (!eyePos.equals(navigator.lastEyePosition)) {
                    terrainElev = wwd.globe.elevationAtLocation(eyePos.latitude, eyePos.longitude);
                    if (eyePos.altitude < terrainElev) {
                        return false;
                    }
                }
                navigator.lastEyePosition.copy(eyePos);
                return true;
            };

            navigator.intermediateState = function() {
                var globe = navigator.worldWindow.globe,
                    lookAtPosition = new WorldWind.Position(
                        navigator.lookAtLocation.latitude,
                        navigator.lookAtLocation.longitude,
                        0),
                    modelview = WorldWind.Matrix.fromIdentity();

                modelview.multiplyByLookAtModelview(lookAtPosition, navigator.range, navigator.heading, navigator.tilt, navigator.roll, globe);

                return navigator.currentStateForModelview(modelview);
            };

        };


        Globe.prototype.updateDateTime = function(time) {
            if (this.dateTime().valueOf() === time.valueOf()) {
                return;
            }
            if (util.minutesBetween(this.lastSolarTime, time) > this.SUNLIGHT_TIME_THRESHOLD) {
                this.updateSunlight(time, this.lastSolarTarget.latitude, this.lastSolarTarget.longitude);
            }
            this.dateTime(time);
        };


        Globe.prototype.incrementDateTime = function(minutes) {
            var msCurrent = this.dateTime().valueOf(),
                msNew = msCurrent + (minutes * 60000);
            this.updateDateTime(new Date(msNew));
        };

        Globe.prototype.updateEyePosition = function() {
            var currentViewpoint = this.getViewpoint(),
                target = currentViewpoint.target,
                time = this.dateTime();

            if (this.viewpoint().equals(currentViewpoint)) {
                return;
            }

            if (!this.lastSolarTarget || this.lastSolarTarget.distanceBetween(target) > this.SUNLIGHT_DISTANCE_THRESHOLD) {
                this.lastSolarTarget.copy(target);
                this.updateSunlight(time, target.latitude, target.longitude);
            }

            this.viewpoint(currentViewpoint);
        };

        Globe.prototype.updateTimeZoneOffset = function() {
            var canvasCenter = new WorldWind.Vec2(this.wwd.canvas.width / 2, this.wwd.canvas.height / 2),
                pickList, i, len, pickedObject,
                userObject, layer, record;

            this.timeZoneLayer.pickEnabled = true;
            pickList = this.wwd.pick(canvasCenter);
            if (pickList.hasNonTerrainObjects()) {

                for (i = 0, len = pickList.objects.length; i < len; i++) {
                    pickedObject = pickList.objects[i];
                    if (pickedObject.isTerrain) {
                        continue;
                    }
                    userObject = pickedObject.userObject;
                    if (userObject.userProperties) {
                        layer = userObject.userProperties.layer;
                        if (layer && layer instanceof TimeZoneLayer) {
                            record = userObject.userProperties.record;
                            if (record) {
                                this.timeZoneName(record.values.time_zone);
                                this.timeZoneOffsetHours(record.values.zone);
                                break;
                            }
                        }
                    }
                }
            }
            this.timeZoneLayer.pickEnabled = false;
        };

        Globe.prototype.updateMousePosition = function(mousePoint) {
            if (mousePoint.equals(this.lastMousePoint)) {
                return;
            }
            this.lastMousePoint.copy(mousePoint);
            var terrain = this.getTerrainAtScreenPoint(mousePoint);

            this.terrainAtMouse(terrain);
        };

        Globe.prototype.updateSunlight = function(time, latitude, longitude) {
            this.lastSolarTime = time;
            this.lastSolarTarget.latitude = latitude;
            this.lastSolarTarget.longitude = longitude;

            this.sunlight(new Sunlight(time, latitude, longitude));
        };

        Globe.prototype.adjustTiledImageLayerDetailHints = function() {
            var width = $(this.wwd.canvas).width(),
                i, len, layer,
                detailHint;

            if (this.canvasWidth === width) {
                return;
            }
            this.canvasWidth = width;

            if (width < 1000) {
                detailHint = -0.1;
            } else {
                detailHint = util.linearInterpolation(width, 1000, 2000, 0, 0.4);
            }


            for (i = 0, len = this.wwd.layers.length; i < len; i++) {
                layer = this.wwd.layers[i];
                if (layer instanceof WorldWind.TiledImageLayer) {
                    layer.detailHint = detailHint;
                }
            }
        };

        Globe.prototype.findLayer = function(name) {
            var layer,
                i, len;
            for (i = 0, len = this.wwd.layers.length; i < len; i++) {
                layer = this.wwd.layers[i];
                if (layer.displayName === name) {
                    return layer;
                }
            }
        };

        Globe.prototype.getTerrainAtLatLon = function(latitude, longitude) {
            return this.terrainProvider.terrainAtLatLon(latitude, longitude);
        };

        Globe.prototype.getTerrainAtLatLonHiRes = function(latitude, longitude, targetResolution) {
            return this.terrainProvider.terrainAtLatLon(latitude, longitude, targetResolution || 1 / WorldWind.EARTH_RADIUS);
        };


        Globe.prototype.getTerrainAtScreenPoint = function(screenPoint) {
            var terrainObject,
                terrain;
            terrainObject = this.wwd.pickTerrain(screenPoint).terrainObject();
            if (terrainObject) {
                terrain = this.terrainProvider.terrainAtLatLon(
                    terrainObject.position.latitude,
                    terrainObject.position.longitude);
            } else {
                terrain = new Terrain();
                terrain.copy(Terrain.INVALID);
            }
            return terrain;
        };

        Globe.prototype.getViewpoint = function() {
            try {
                var wwd = this.wwd,
                    centerPoint = new WorldWind.Vec2(wwd.canvas.width / 2, wwd.canvas.height / 2),
                    navigatorState = wwd.navigator.currentState(),
                    eyePoint = navigatorState.eyePoint,
                    eyePos = new WorldWind.Position(),
                    target, viewpoint;
                if (eyePoint.equals(this.lastEyePoint)) {
                    return this.lastViewpoint;
                }
                this.lastEyePoint.copy(eyePoint);
                wwd.globe.computePositionFromPoint(eyePoint[0], eyePoint[1], eyePoint[2], eyePos);
                target = this.getTerrainAtScreenPoint(centerPoint);
                viewpoint = new Viewpoint(eyePos, target);
                this.lastViewpoint.copy(viewpoint);
                return viewpoint;
            } catch (e) {
                log.error("Globe", "getViewpoint", e.toString());
                return Viewpoint.INVALID;
            }
        };

        Globe.prototype.goto = function(latitude, longitude, range, callback) {
            if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
                log.error("Globe", "gotoLatLon", "Invalid Latitude and/or Longitude.");
                return;
            }
            var self = this;
            if (this.isAnimating) {
                this.goToAnimator.cancel();
            }
            this.isAnimating = true;
            this.goToAnimator.goTo(new WorldWind.Position(latitude, longitude, range), function() {
                self.isAnimating = false;
                if (callback) {
                    callback();
                }
            });
        };


        Globe.prototype.lookAt = function(latitude, longitude, range) {
            if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
                log.error("Globe", "lookAt", "Invalid Latitude and/or Longitude.");
                return;
            }
            this.wwd.navigator.lookAtLocation.latitude = latitude;
            this.wwd.navigator.lookAtLocation.longitude = longitude;
            if (range) {
                this.wwd.navigator.range = range;
            }
            this.wwd.redraw();
        };

        Globe.prototype.redraw = function() {
            this.wwd.redraw();
        };

        Globe.prototype.refreshLayers = function() {
            var i, len, layer;

            for (i = 0, len = this.wwd.layers.length; i < len; i++) {
                layer = this.wwd.layers[i];
                if (layer.isTemporal) {
                    layer.refresh();
                }
                this.wwd.redraw();
            }

        };

        Globe.prototype.reset = function() {
            this.wwd.navigator.lookAtLocation.latitude = Number(config.startupLatitude);
            this.wwd.navigator.lookAtLocation.longitude = Number(config.startupLongitude);
            this.wwd.navigator.range = Number(config.startupAltitude);
            this.wwd.navigator.heading = Number(config.startupHeading);
            this.wwd.navigator.tilt = Number(config.startupTilt);
            this.wwd.navigator.roll = Number(config.startupRoll);
            this.wwd.redraw();
        };

        Globe.prototype.resetHeading = function() {
            this.wwd.navigator.heading = Number(0);
            this.wwd.redraw();
        };

        Globe.prototype.resetHeadingAndTilt = function() {
            var viewpoint = this.getViewpoint(),
                lat = viewpoint.target.latitude,
                lon = viewpoint.target.longitude;
            this.wwd.navigator.heading = 0;
            this.wwd.navigator.tilt = 0;
            this.wwd.redraw();

            this.lookAt(lat, lon);
        };

        Globe.prototype.setFocus = function() {
            this.wwd.canvas.focus();
        };

        Globe.prototype.setProjection = function(projectionName) {
            if (projectionName === constants.PROJECTION_NAME_3D) {
                if (!this.roundGlobe) {
                    this.roundGlobe = new WorldWind.Globe(new WorldWind.EarthElevationModel());
                }

                if (this.wwd.globe !== this.roundGlobe) {
                    this.wwd.globe = this.roundGlobe;
                }
            } else {
                if (!this.flatGlobe) {
                    this.flatGlobe = new WorldWind.Globe2D();
                }

                if (projectionName === constants.PROJECTION_NAME_EQ_RECT) {
                    this.flatGlobe.projection = new WorldWind.ProjectionEquirectangular();
                } else if (projectionName === constants.PROJECTION_NAME_MERCATOR) {
                    this.flatGlobe.projection = new WorldWind.ProjectionMercator();
                } else if (projectionName === constants.PROJECTION_NAME_NORTH_POLAR) {
                    this.flatGlobe.projection = new WorldWind.ProjectionPolarEquidistant("North");
                } else if (projectionName === constants.PROJECTION_NAME_SOUTH_POLAR) {
                    this.flatGlobe.projection = new WorldWind.ProjectionPolarEquidistant("South");
                } else if (projectionName === constants.PROJECTION_NAME_NORTH_UPS) {
                    this.flatGlobe.projection = new WorldWind.ProjectionUPS("North");
                } else if (projectionName === constants.PROJECTION_NAME_SOUTH_UPS) {
                    this.flatGlobe.projection = new WorldWind.ProjectionUPS("South");
                } else if (projectionName === constants.PROJECTION_NAME_NORTH_GNOMONIC) {
                    this.flatGlobe.projection = new WorldWind.ProjectionGnomonic("North");
                } else if (projectionName === constants.PROJECTION_NAME_SOUTH_GNOMONIC) {
                    this.flatGlobe.projection = new WorldWind.ProjectionGnomonic("South");
                }

                if (this.wwd.globe !== this.flatGlobe) {
                    this.wwd.globe = this.flatGlobe;
                }
            }
            this.wwd.redraw();

        };
        return Globe;
    }
);