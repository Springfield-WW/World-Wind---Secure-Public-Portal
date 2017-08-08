define([
        '../geom/Location',
        '../util/Logger',
        '../geom/Position',
        '../geom/Vec3'
    ],
    function(Location,
        Logger,
        Position,
        Vec3) {
        "use strict";

        var GoToAnimator = function(worldWindow) {
            if (!worldWindow) {
                throw new ArgumentError(Logger.logMessage(Logger.LEVEL_SEVERE, "GoToAnimator", "constructor",
                    "missingWorldWindow"));
            }

            this.wwd = worldWindow;

            this.animationFrequency = 20;

            this.travelTime = 3000;

            this.cancelled = false;
        };

        GoToAnimator.prototype.cancel = function() {
            this.cancelled = true;
        };

        GoToAnimator.prototype.goTo = function(position, completionCallback) {
            if (!position) {
                throw new ArgumentError(Logger.logMessage(Logger.LEVEL_SEVERE, "GoToAnimator", "goTo",
                    "missingPosition"));
            }

            this.completionCallback = completionCallback;

            this.cancelled = false;

            this.targetPosition = new Position(position.latitude, position.longitude,
                position.altitude || this.wwd.navigator.range);

            this.startPosition = new Position(
                this.wwd.navigator.lookAtLocation.latitude,
                this.wwd.navigator.lookAtLocation.longitude,
                this.wwd.navigator.range);
            this.startTime = Date.now();

            var animationDuration = this.travelTime,
                panDistance = Location.greatCircleDistance(this.startPosition, this.targetPosition),
                rangeDistance;

            var pA = this.wwd.globe.computePointFromLocation(
                    this.startPosition.latitude, this.startPosition.longitude, new Vec3(0, 0, 0)),
                pB = this.wwd.globe.computePointFromLocation(
                    this.targetPosition.latitude, this.targetPosition.longitude, new Vec3(0, 0, 0));
            this.maxAltitude = pA.distanceTo(pB);

            var viewportSize = this.wwd.navigator.currentState().pixelSizeAtDistance(this.startPosition.altitude) *
                this.wwd.canvas.clientWidth / this.wwd.globe.equatorialRadius;

            if (panDistance <= 2 * viewportSize) {
                this.maxAltitude = this.startPosition.altitude;
            }

            this.maxAltitudeReachedTime = this.maxAltitude <= this.wwd.navigator.range ? Date.now() : null;

            if (this.maxAltitude > this.startPosition.altitude) {
                rangeDistance = Math.max(0, this.maxAltitude - this.startPosition.altitude);
                rangeDistance += Math.abs(this.targetPosition.altitude - this.maxAltitude);
            } else {
                rangeDistance = Math.abs(this.targetPosition.altitude - this.startPosition.altitude);
            }

            var animationDistance = Math.max(panDistance, rangeDistance / this.wwd.globe.equatorialRadius);
            if (animationDistance === 0) {
                return;
            }

            if (animationDistance < 2 * viewportSize) {
                animationDuration = Math.min((animationDistance / viewportSize) * this.travelTime, this.travelTime);
            }

            animationDuration = Math.max(1, animationDuration);

            this.panVelocity = panDistance / animationDuration;

            this.rangeVelocity = rangeDistance / animationDuration; // meters per millisecond

            var thisAnimator = this;
            var timerCallback = function() {
                if (thisAnimator.cancelled) {
                    if (thisAnimator.completionCallback) {
                        thisAnimator.completionCallback(thisAnimator);
                    }
                    return;
                }

                if (thisAnimator.update()) {
                    setTimeout(timerCallback, thisAnimator.animationFrequency);
                } else if (thisAnimator.completionCallback) {
                    thisAnimator.completionCallback(thisAnimator);
                }
            };
            setTimeout(timerCallback, this.animationFrequency);
        };

        GoToAnimator.prototype.update = function() {

            var currentPosition = new Position(
                this.wwd.navigator.lookAtLocation.latitude,
                this.wwd.navigator.lookAtLocation.longitude,
                this.wwd.navigator.range);

            var continueAnimation = this.updateRange(currentPosition);
            continueAnimation = this.updateLocation(currentPosition) || continueAnimation;

            this.wwd.redraw();

            return continueAnimation;
        };

        GoToAnimator.prototype.updateRange = function(currentPosition) {
            var continueAnimation = false,
                nextRange, elapsedTime;

            if (!this.maxAltitudeReachedTime) {
                elapsedTime = Date.now() - this.startTime;
                nextRange = Math.min(this.startPosition.altitude + this.rangeVelocity * elapsedTime, this.maxAltitude);
                if (Math.abs(this.wwd.navigator.range - nextRange) < 1) {
                    this.maxAltitudeReachedTime = Date.now();
                }
                this.wwd.navigator.range = nextRange;
                continueAnimation = true;
            } else {
                elapsedTime = Date.now() - this.maxAltitudeReachedTime;
                if (this.maxAltitude > this.targetPosition.altitude) {
                    nextRange = this.maxAltitude - (this.rangeVelocity * elapsedTime);
                    nextRange = Math.max(nextRange, this.targetPosition.altitude);
                } else {
                    nextRange = this.maxAltitude + (this.rangeVelocity * elapsedTime);
                    nextRange = Math.min(nextRange, this.targetPosition.altitude);
                }
                this.wwd.navigator.range = nextRange;
                continueAnimation = Math.abs(this.wwd.navigator.range - this.targetPosition.altitude) > 1;
            }

            return continueAnimation;
        };

        GoToAnimator.prototype.updateLocation = function(currentPosition) {
            var elapsedTime = Date.now() - this.startTime,
                distanceTravelled = Location.greatCircleDistance(this.startPosition, currentPosition),
                distanceRemaining = Location.greatCircleDistance(currentPosition, this.targetPosition),
                azimuthToTarget = Location.greatCircleAzimuth(currentPosition, this.targetPosition),
                distanceForNow = this.panVelocity * elapsedTime,
                nextDistance = Math.min(distanceForNow - distanceTravelled, distanceRemaining),
                nextLocation = Location.greatCircleLocation(currentPosition, azimuthToTarget, nextDistance,
                    new Location(0, 0)),
                locationReached = false;

            this.wwd.navigator.lookAtLocation.latitude = nextLocation.latitude;
            this.wwd.navigator.lookAtLocation.longitude = nextLocation.longitude;

            if (nextDistance < 1 / this.wwd.globe.equatorialRadius) {
                locationReached = true;
            }

            return !locationReached;
        };

        return GoToAnimator;
    });