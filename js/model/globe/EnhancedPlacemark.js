define(['worldwind'],
    function(ww) {
        "use strict";

        var EnhancedPlacemark = function(position, eyeDistanceScaling) {

            WorldWind.Placemark.call(this, position, eyeDistanceScaling);

            this.imageRotation = 0;
            this.imageTilt = 0;

        };
        EnhancedPlacemark.prototype = Object.create(WorldWind.Placemark.prototype);

        EnhancedPlacemark.prototype.copy = function(that) {
            WorldWind.Placemark.prototype.copy.call(this, that);

            this.imageRotation = that.imageRotation;
            this.imageTilt = that.imageTilt;

            return this;
        };
        EnhancedPlacemark.prototype.clone = function() {
            var clone = new EnhancedPlacemark(this.position);

            clone.copy(this);
            clone.pickDelegate = this.pickDelegate || this;

            return clone;
        };


        EnhancedPlacemark.prototype.doDrawOrderedPlacemark = function(dc) {
            var gl = dc.currentGlContext,
                program = dc.currentProgram,
                depthTest = true,
                textureBound;

            if (dc.pickingMode) {
                this.pickColor = dc.uniquePickColor();
            }

            if (this.eyeDistanceScaling && (this.eyeDistance > this.eyeDistanceScalingLabelThreshold)) {
                this.targetVisibility = 0;
            }
            if (!dc.pickingMode && this.mustDrawLabel()) {
                if (this.currentVisibility != this.targetVisibility) {
                    var visibilityDelta = (dc.timestamp - dc.previousTimestamp) / dc.fadeTime;
                    if (this.currentVisibility < this.targetVisibility) {
                        this.currentVisibility = Math.min(1, this.currentVisibility + visibilityDelta);
                    } else {
                        this.currentVisibility = Math.max(0, this.currentVisibility - visibilityDelta);
                    }
                    dc.redrawRequested = true;
                }
            }

            program.loadOpacity(gl, dc.pickingMode ? 1 : this.layer.opacity);

            if (this.mustDrawLeaderLine(dc)) {
                if (!this.leaderLinePoints) {
                    this.leaderLinePoints = new WorldWind.Float32Array(6);
                }

                this.leaderLinePoints[0] = this.groundPoint[0];
                this.leaderLinePoints[1] = this.groundPoint[1];
                this.leaderLinePoints[2] = this.groundPoint[2];
                this.leaderLinePoints[3] = this.placePoint[0];
                this.leaderLinePoints[4] = this.placePoint[1];
                this.leaderLinePoints[5] = this.placePoint[2];

                if (!this.leaderLineCacheKey) {
                    this.leaderLineCacheKey = dc.gpuResourceCache.generateCacheKey();
                }

                var leaderLineVboId = dc.gpuResourceCache.resourceForKey(this.leaderLineCacheKey);
                if (!leaderLineVboId) {
                    leaderLineVboId = gl.createBuffer();
                    dc.gpuResourceCache.putResource(this.leaderLineCacheKey, leaderLineVboId,
                        this.leaderLinePoints.length * 4);
                }

                program.loadTextureEnabled(gl, false);
                program.loadColor(gl, dc.pickingMode ? this.pickColor :
                    this.activeAttributes.leaderLineAttributes.outlineColor);

                WorldWind.Placemark.matrix.copy(dc.navigatorState.modelviewProjection);
                program.loadModelviewProjection(gl, WorldWind.Placemark.matrix);

                if (!this.activeAttributes.leaderLineAttributes.depthTest) {
                    gl.disable(WebGLRenderingContext.DEPTH_TEST);
                }

                gl.lineWidth(this.activeAttributes.leaderLineAttributes.outlineWidth);

                gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, leaderLineVboId);
                gl.bufferData(WebGLRenderingContext.ARRAY_BUFFER, this.leaderLinePoints, WebGLRenderingContext.STATIC_DRAW);
                dc.frameStatistics.incrementVboLoadCount(1);
                gl.vertexAttribPointer(program.vertexPointLocation, 3, WebGLRenderingContext.FLOAT, false, 0, 0);
                gl.drawArrays(WebGLRenderingContext.LINES, 0, 2);
            }

            if (!this.activeAttributes.depthTest) {
                depthTest = false;
                gl.disable(WebGLRenderingContext.DEPTH_TEST);
            }

            gl.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, dc.unitQuadBuffer3());
            gl.vertexAttribPointer(program.vertexPointLocation, 3, WebGLRenderingContext.FLOAT, false, 0, 0);

            WorldWind.Placemark.matrix.copy(dc.screenProjection);
            WorldWind.Placemark.matrix.multiplyMatrix(this.imageTransform);

            if (this.imageRotation !== 0 || this.imageTilt !== 0) {
                WorldWind.Placemark.matrix.multiplyByTranslation(0.5, 0.5, -0.5);
                WorldWind.Placemark.matrix.multiplyByRotation(1, 0, 0, this.imageTilt);
                WorldWind.Placemark.matrix.multiplyByRotation(0, 0, 1, this.imageRotation);
                WorldWind.Placemark.matrix.multiplyByTranslation(-0.5, -0.5, 0);
            }

            program.loadModelviewProjection(gl, WorldWind.Placemark.matrix);

            program.loadTextureEnabled(gl, true);

            if (dc.pickingMode) {
                program.loadColor(gl, this.pickColor);
            } else {
                program.loadColor(gl, this.activeAttributes.imageColor);
            }

            this.texCoordMatrix.setToIdentity();
            if (this.activeTexture) {
                this.texCoordMatrix.multiplyByTextureTransform(this.activeTexture);
            }
            program.loadTextureMatrix(gl, this.texCoordMatrix);

            if (this.activeTexture) {
                textureBound = this.activeTexture.bind(dc);
                program.loadTextureEnabled(gl, textureBound);
            } else {
                program.loadTextureEnabled(gl, false);
            }

            gl.drawArrays(WebGLRenderingContext.TRIANGLE_STRIP, 0, 4);

            if (this.mustDrawLabel() && this.currentVisibility > 0) {
                program.loadOpacity(gl, dc.pickingMode ? 1 : this.layer.opacity * this.currentVisibility);

                WorldWind.Placemark.matrix.copy(dc.screenProjection);
                WorldWind.Placemark.matrix.multiplyMatrix(this.labelTransform);
                program.loadModelviewProjection(gl, WorldWind.Placemark.matrix);

                if (!dc.pickingMode && this.labelTexture) {
                    this.texCoordMatrix.setToIdentity();
                    this.texCoordMatrix.multiplyByTextureTransform(this.labelTexture);

                    program.loadTextureMatrix(gl, this.texCoordMatrix);
                    program.loadColor(gl, this.activeAttributes.labelAttributes.color);

                    textureBound = this.labelTexture.bind(dc);
                    program.loadTextureEnabled(gl, textureBound);
                } else {
                    program.loadTextureEnabled(gl, false);
                    program.loadColor(gl, this.pickColor);
                }

                if (this.activeAttributes.labelAttributes.depthTest) {
                    if (!depthTest) {
                        depthTest = true;
                        gl.enable(WebGLRenderingContext.DEPTH_TEST);
                    }
                } else {
                    depthTest = false;
                    gl.disable(WebGLRenderingContext.DEPTH_TEST);
                }

                gl.drawArrays(WebGLRenderingContext.TRIANGLE_STRIP, 0, 4);
            }

            if (!depthTest) {
                gl.enable(WebGLRenderingContext.DEPTH_TEST);
            }


        };


        return EnhancedPlacemark;
    });