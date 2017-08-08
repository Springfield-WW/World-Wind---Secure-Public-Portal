define([
        'model/globe/Crosshairs',
        'model/Constants',
        'worldwind'
    ],
    function(
        Crosshairs,
        constants,
        ww) {
        "use strict";

        var ReticuleLayer = function() {
            WorldWind.RenderableLayer.call(this, "Crosshairs");

            this._reticule = new Crosshairs(constants.IMAGE_PATH);

            this.addRenderable(this._reticule);
        };

        ReticuleLayer.prototype = Object.create(WorldWind.RenderableLayer.prototype);

        Object.defineProperties(ReticuleLayer.prototype, {
            reticule: {
                get: function() {
                    return this._reticule;
                },
                set: function(reticule) {
                    if (reticule && reticule instanceof Crosshairs) {
                        this.removeAllRenderables();
                        this.addRenderable(reticule);
                        this._reticule = reticule;
                    }
                }
            }
        });

        return ReticuleLayer;
    }
);