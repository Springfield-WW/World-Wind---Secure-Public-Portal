define([
        'worldwind'
    ],
    function(
        ww) {
        "use strict";
        var DnDController = function(worldWindow) {
            this.wwd = worldWindow;

            this.isArmed = false;

            var self = this,
                clickRecognizer;

            this.wwd.addEventListener("click", function(event) {
                self.handleDrop(event);
            });
            this.wwd.addEventListener("touchend", function(event) {
                self.handleDrop(event);
            });


        };

        DnDController.prototype.armDrop = function(dropObject, dropCallback) {
            this.dropObject = dropObject;
            this.dropCallback = dropCallback;

            this.isArmed = true;
            $(this.wwd.canvas).css('cursor', 'crosshair');
        };

        DnDController.prototype.handleDrop = function(event) {
            if (!this.isArmed) {
                return;
            }
            var type = event.type,
                x,
                y,
                pickList,
                terrainObject;

            switch (type) {
                case 'click':
                    x = event.clientX;
                    y = event.clientY;
                    break;
                case 'touchend':
                    if (!event.changedTouches[0]) {
                        return;
                    }
                    x = event.changedTouches[0].clientX;
                    y = event.changedTouches[0].clientY;
                    break;
            }
            pickList = this.wwd.pickTerrain(this.wwd.canvasCoordinates(x, y));
            terrainObject = pickList.terrainObject();
            if (terrainObject) {
                this.dropObject.latitude = terrainObject.position.latitude;
                this.dropObject.longitude = terrainObject.position.longitude;

                $(this.wwd.canvas).css('cursor', 'pointer');
                this.isArmed = false;
                event.stopImmediatePropagation();

                this.dropCallback(this.dropObject);
            }
        };

        return DnDController;
    }
);