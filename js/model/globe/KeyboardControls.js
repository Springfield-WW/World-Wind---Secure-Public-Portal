define([
        'model/util/Log',
        'worldwind'
    ],
    function(
        Log,
        ww) {
        "use strict";
        var KeyboardControls = function(globe) {
            this.globe = globe;
            this.wwd = globe.wwd;

            var self = this;
            $(function() {
                var $canvas = $(globe.wwd.canvas);
                $canvas.keydown(function(event) {
                    self.handleKeyDown(event);
                });
                $canvas.keyup(function(event) {
                    self.handleKeyUp(event);
                });
            });
            this.zoomIncrement = 0.01;

            this.panIncrement = 0.0000000005;

        };

        KeyboardControls.prototype.handleKeyDown = function(event) {
            Log.info('KeyboardControls', 'handleKeyDown', event.keyCode + ' pressed.');
            Log.info('KeyboardControls', 'handleKeyDown', "Target: " + event.target);

            if (event.keyCode === 187) {
                this.handleZoom("zoomIn");
            } else if (event.keyCode === 189) {
                this.handleZoom("zoomOut");
            } else if (event.keyCode === 37) {
                this.handlePan("panLeft");
            } else if (event.keyCode === 38) {
                this.handlePan("panUp");
            } else if (event.keyCode === 39) {
                this.handlePan("panRight");
            } else if (event.keyCode === 40) {
                this.handlePan("panDown");
            } else if (event.keyCode === 78) {
                this.resetHeading();
            } else if (event.keyCode === 82) {
                this.resetHeadingAndTilt();
            }
        };

        KeyboardControls.prototype.resetHeading = function() {
            this.globe.resetHeading();
        };

        KeyboardControls.prototype.resetHeadingAndTilt = function() {};

        KeyboardControls.prototype.handleKeyUp = function(event) {
            if (this.activeOperation) {
                this.activeOperation = null;
                event.preventDefault();
            }
        };

        KeyboardControls.prototype.handleZoom = function(operation) {
            this.activeOperation = this.handleZoom;

            var self = this,
                setRange = function() {
                    if (self.activeOperation) {
                        if (operation === "zoomIn") {
                            self.wwd.navigator.range *= (1 - self.zoomIncrement);
                        } else if (operation === "zoomOut") {
                            self.wwd.navigator.range *= (1 + self.zoomIncrement);
                        }
                        self.wwd.redraw();
                        setTimeout(setRange, 50);
                    }
                };
            setTimeout(setRange, 50);
            event.preventDefault();

        };

        KeyboardControls.prototype.handlePan = function(operation) {
            this.activeOperation = this.handlePan;

            var self = this,
                setLookAtLocation = function() {
                    if (self.activeOperation) {
                        var heading = self.wwd.navigator.heading,
                            distance = self.panIncrement * self.wwd.navigator.range;

                        switch (operation) {
                            case 'panUp':
                                break;
                            case 'panDown':
                                heading -= 180;
                                break;
                            case 'panLeft':
                                heading -= 90;
                                break;
                            case 'panRight':
                                heading += 90;
                                break;
                        }
                        WorldWind.Location.greatCircleLocation(
                            self.wwd.navigator.lookAtLocation,
                            heading,
                            distance,
                            self.wwd.navigator.lookAtLocation);
                        self.wwd.redraw();
                        setTimeout(setLookAtLocation, 50);
                    }
                };
            setTimeout(setLookAtLocation, 50);
            event.preventDefault();
        };


        return KeyboardControls;
    }
);