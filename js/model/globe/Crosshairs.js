define(['worldwind'],
    function(ww) {
        "use strict";
        var Crosshairs = function(imagePath) {

            var sOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0.5),
                iPath = imagePath + "32x32-crosshair-outline.png";

            WorldWind.ScreenImage.call(this, sOffset, iPath);

            this.imageOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0.5);
            this.imageScale = 1.2;
        };

        Crosshairs.prototype = Object.create(WorldWind.ScreenImage.prototype);

        return Crosshairs;
    }
);