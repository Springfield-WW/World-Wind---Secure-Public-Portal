define(['model/Constants', 'worldwind'],
    function(constants, ww) {
        "use strict";
        var EnhancedViewControlsLayer = function(worldWindow) {

            ww.ViewControlsLayer.call(this, worldWindow);

            this.placement = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0,
                WorldWind.OFFSET_FRACTION, 1);
            this.alignment = new WorldWind.Offset(
                WorldWind.OFFSET_PIXELS, -10,
                WorldWind.OFFSET_INSET_PIXELS, -18);

        };
        EnhancedViewControlsLayer.prototype = Object.create(ww.ViewControlsLayer.prototype);

        return EnhancedViewControlsLayer;
    }
);