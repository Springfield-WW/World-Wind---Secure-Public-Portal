define([], function() {
    "use strict";
    var Events = {
        EVENT_MARKER_ADDED: "markerAdded",
        EVENT_MARKER_CHANGED: "markerChanged",
        EVENT_MARKER_REMOVED: "markerRemoved",
        EVENT_MOUSE_MOVED: "mouseMoved",
        EVENT_OBJECT_OPENED: "objectOpened",
        EVENT_OBJECT_CHANGED: "objectChanged",
        EVENT_OBJECT_MOVE_STARTED: "objectMoveStarted",
        EVENT_OBJECT_MOVED: "objectMoved",
        EVENT_OBJECT_MOVE_FINISHED: "objectMoveFinished",
        EVENT_OBJECT_REMOVED: "objectRemoved",
        EVENT_OBJECT_SELECTED: "objectSelected",
        EVENT_PLACE_CHANGED: "placeChanged",
        EVENT_SUNLIGHT_CHANGED: "sunlightChanged",
        EVENT_SURFACEFUEL_CHANGED: "surfaceFuelChanged",
        EVENT_SURFACEFIRE_CHANGED: "surfaceFireChanged",
        EVENT_TERRAIN_CHANGED: "terrainChanged",
        EVENT_TIME_CHANGED: "timeChanged",
        EVENT_VIEWPOINT_CHANGED: "viewpointChanged"
    }

    return Events;
});