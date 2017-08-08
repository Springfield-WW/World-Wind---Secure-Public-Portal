define(['knockout'],
    function(ko) {
        "use strict";
        var SelectController = function(worldWindow) {
            var self = this;

            this.wwd = worldWindow;
            this.isDragging = false;
            this.tapped = false;
            this.DOUBLE_TAP_INTERVAL = 250;
            this.lastSelectedItem = ko.observable(null);
            this.pickedItem = null;
            this.clickedItem = null;
            this.highlightedItems = [];

            function eventListener(event) {
                self.handlePick(event);
            }
            if (window.PointerEvent) {
                this.wwd.addEventListener("pointerdown", eventListener);
                this.wwd.addEventListener("pointermove", eventListener);
                this.wwd.addEventListener("pointerup", eventListener);
                this.wwd.addEventListener("pointerout", eventListener);
            }
            this.wwd.addEventListener("mousedown", eventListener);
            this.wwd.addEventListener("mousemove", eventListener);
            this.wwd.addEventListener("mouseup", eventListener);
            this.wwd.addEventListener("mouseout", eventListener);
            this.wwd.addEventListener("touchstart", eventListener);
            this.wwd.addEventListener("touchmove", eventListener);
            this.wwd.addEventListener("touchend", eventListener);
            this.wwd.addEventListener("click", eventListener);
            this.wwd.addEventListener("dblclick", eventListener);
            this.wwd.addEventListener("contextmenu", eventListener);

        };

        SelectController.prototype.handlePick = function(o) {
            var eventType,
                x, y,
                h, len,
                redrawRequired,
                pickList,
                button = o.button,
                isTouchDevice = false;

            len = this.highlightedItems.length;
            redrawRequired = len > 0;
            for (h = 0; h < len; h++) {
                this.highlightedItems[h].highlighted = false;
            }
            this.highlightedItems = [];


            if (o.type === "pointerdown" && o.pointerType === "mouse") {
                eventType = "mousedown";
            } else if (o.type === "pointermove" && o.pointerType === "mouse") {
                eventType = "mousemove";
            } else if (o.type === "pointerout" && o.pointerType === "mouse") {
                eventType = "mouseout";
            } else if (o.type === "pointerup" && o.pointerType === "mouse") {
                eventType = "mouseup";
            } else if (o.type === "pointerdown" && o.pointerType === "touch") {
                eventType = "touchstart";
            } else if (o.type === "pointermove" && o.pointerType === "touch") {
                eventType = "touchmove";
            } else if (o.type === "pointercancel" && o.pointerType === "touch") {
                eventType = "touchcancel";
            } else if (o.type === "pointerup" && o.pointerType === "touch") {
                eventType = "touchend";
            } else {
                eventType = o.type;
            }

            if (eventType.substring(0, 5) === 'touch') {
                isTouchDevice = true;
                if (o.touches && o.touches.length > 0) {
                    x = o.touches[0].clientX;
                    y = o.touches[0].clientY;
                } else {
                    x = o.clientX;
                    y = o.clientY;
                }
            } else {
                if (isTouchDevice) {
                    return;
                }
                x = o.clientX;
                y = o.clientY;
            }


            pickList = this.wwd.pick(this.wwd.canvasCoordinates(x, y));

            switch (eventType) {
                case "mousedown":
                case "touchstart":
                    this.handleMouseDown(pickList, x, y);
                    break;
                case "mousemove":
                case "touchmove":
                    this.handleMouseMove(pickList, x, y, eventType, button);
                    break;
                case "mouseup":
                case "mouseout":
                case "touchend":
                case "touchcancel":
                    this.handleMouseUp(eventType);
                    break;
                case "click":
                    this.handleClick();
                    break;
                case "dblclick":
                    this.handleDoubleClick();
                    break;
                case "contextmenu":
                    this.handleContextMenu();
                    break;
            }
            if (this.isDragging) {
                o.preventDefault();
            }
            if (redrawRequired) {
                this.wwd.redraw();
            }
        };

        SelectController.prototype.handleMouseDown = function(pickList, x, y) {

            if (pickList.hasNonTerrainObjects()) {
                this.pickedItem = pickList.topPickedObject();
                if (this.pickedItem) {
                    this.startX = x;
                    this.startY = y;
                }
            } else {
                this.pickedItem = null;
            }
        };

        SelectController.prototype.handleMouseMove = function(pickList, x, y, eventType, button) {
            var p, len,
                terrainObject;
            len = pickList.objects.length;
            if (len > 0 && button === -1) {
                for (p = 0; p < len; p++) {
                    if (!pickList.objects[p].isTerrain) {
                        pickList.objects[p].userObject.highlighted = true;
                        this.highlightedItems.push(pickList.objects[p].userObject);
                    }
                }
            }
            if (this.pickedItem && (button === 0 || eventType === "touchmove")) {
                if (this.isMovable(this.pickedItem.userObject)) {
                    if (!this.isDragging &&
                        (Math.abs(this.startX - x) > 2 || Math.abs(this.startY - y) > 2)) {
                        this.isDragging = true;
                        this.startMove(this.pickedItem.userObject);
                    }
                    if (this.isDragging) {
                        terrainObject = pickList.terrainObject();
                        if (terrainObject) {
                            this.doMove(this.pickedItem.userObject, terrainObject);
                        }
                    }
                }
            }
        };

        SelectController.prototype.handleMouseUp = function(eventType) {
            var self = this;

            if (this.pickedItem) {
                if (this.isDragging) {
                    this.finishMove(this.pickedItem.userObject);
                    this.pickedItem = null;
                } else if (eventType === "touchend") {
                    if (!this.tapped) {
                        this.clickedItem = this.pickedItem;
                        this.tapped = setTimeout(function() {
                            self.tapped = null;
                            self.doSelect(self.clickedItem.userObject);
                        }, this.DOUBLE_TAP_INTERVAL);
                    } else {
                        clearTimeout(this.tapped);
                        this.tapped = null;
                        this.doOpen(this.pickedItem.userObject);
                    }
                    this.pickedItem = null;
                }
            }
            this.isDragging = false;
        };

        SelectController.prototype.handleClick = function() {
            this.clickedItem = this.pickedItem;
            if (this.clickedItem) {
                this.doSelect(this.clickedItem.userObject);
            }
            this.pickedItem = null;
        };

        SelectController.prototype.handleDoubleClick = function() {
            if (this.clickedItem) {
                this.doOpen(this.clickedItem.userObject);
            }
            this.pickedItem = null;
        };

        SelectController.prototype.handleContextMenu = function() {
            this.isDragging = false;
            if (this.pickedItem) {
                this.doContextSensitive(this.pickedItem.userObject);
                this.pickedItem = null;
            }
        };


        SelectController.prototype.doContextSensitive = function(userObject) {
            if (ko.isObservable(userObject.isContextSensitive) && userObject.isContextSensitive()) {
                if (userObject.showContextMenu) {
                    userObject.showContextMenu();
                } else {}
            }
        };

        SelectController.prototype.isMovable = function(userObject) {
            if (ko.isObservable(userObject.isMovable)) {
                return userObject.isMovable();
            } else {
                return userObject.isMovable;
            }
        };

        SelectController.prototype.startMove = function(userObject) {
            if (userObject.moveStarted) {
                userObject.moveStarted();
            }
        };

        SelectController.prototype.doMove = function(userObject, terrainObject) {
            if (userObject.moveToLatLon) {
                userObject.moveToLatLon(
                    terrainObject.position.latitude,
                    terrainObject.position.longitude);
            }

        };

        SelectController.prototype.finishMove = function(userObject) {
            if (userObject.moveFinished) {
                userObject.moveFinished();
            }
        };

        SelectController.prototype.doSelect = function(userObject) {
            if (ko.isObservable(userObject.isSelectable) && userObject.isSelectable()) {
                if (this.lastSelectedItem() === userObject) {
                    return;
                }
                if (this.lastSelectedItem() !== null) {
                    this.lastSelectedItem().select({
                        selected: false
                    });
                    this.lastSelectedItem(null);
                }
                if (userObject.select) {
                    userObject.select({
                        selected: true
                    });
                    this.lastSelectedItem(userObject);
                }
            }
        };

        SelectController.prototype.doDeselect = function(userObject) {
            if (this.lastSelectedItem() === userObject) {
                this.lastSelectedItem().select({
                    selected: false
                });
                this.lastSelectedItem(null);
            }
        };

        SelectController.prototype.doOpen = function(userObject) {
            if (ko.isObservable(userObject.isOpenable) && userObject.isOpenable()) {
                if (userObject.open) {
                    userObject.open();
                }
            }
        };

        return SelectController;
    }
);