define(['knockout',
        'model/Constants',
        'model/markers/BasicMarker',
        'worldwind'
    ],
    function(ko,
        constants,
        BasicMarker,
        ww) {

        "use strict";
        var MarkerManager = function(globe, layer) {
            var self = this;
            this.globe = globe;
            this.layer = layer || globe.findLayer(constants.LAYER_NAME_MARKERS);
            this.markers = ko.observableArray();

            this.markers.subscribe(function(changes) {
                changes.forEach(function(change) {
                    if (change.status === 'added' && change.moved === undefined) {
                        self.doEnsureUniqueName(change.value);
                        self.doAddMarkerToLayer(change.value);
                    } else if (change.status === 'deleted' && change.moved === undefined) {
                        self.doRemoveMarkerFromLayer(change.value);
                    }
                });
            }, null, "arrayChange");
        };

        MarkerManager.prototype.addMarker = function(marker) {
            this.markers.push(marker);
        };

        MarkerManager.prototype.findMarker = function(id) {
            var marker, i, len;
            for (i = 0, len = this.markers.length(); i < len; i += 1) {
                marker = this.markers()[i];
                if (marker.id === id) {
                    return marker;
                }
            }
            return null;
        };


        MarkerManager.prototype.removeMarker = function(marker) {
            this.markers.remove(marker);
        };

        MarkerManager.prototype.doEnsureUniqueName = function(marker) {
            marker.name(this.generateUniqueName(marker));
        };

        MarkerManager.prototype.doAddMarkerToLayer = function(marker) {
            this.layer.addRenderable(marker.placemark);
        };

        MarkerManager.prototype.doRemoveMarkerFromLayer = function(marker) {
            var i, max, placemark = marker.placemark;
            for (i = 0, max = this.layer.renderables.length; i < max; i++) {
                if (this.layer.renderables[i] === placemark) {
                    this.layer.renderables.splice(i, 1);
                    break;
                }
            }
            this.globe.selectController.doDeselect(marker);
        };

        MarkerManager.prototype.saveMarkers = function() {
            var validMarkers = [],
                markersString,
                i, len, marker;

            for (var i = 0, len = this.markers().length; i < len; i++) {
                marker = this.markers()[i];
                if (!marker.invalid) {
                    validMarkers.push({
                        id: marker.id,
                        name: marker.name,
                        source: marker.source,
                        latitude: marker.latitude,
                        longitude: marker.longitude,
                        isMovable: marker.isMovable
                    });
                }
            }
            markersString = ko.toJSON(validMarkers, ['id', 'name', 'source', 'latitude', 'longitude', 'isMovable']);
            localStorage.setItem(constants.STORAGE_KEY_MARKERS, markersString);
        };

        MarkerManager.prototype.restoreMarkers = function() {
            var string = localStorage.getItem(constants.STORAGE_KEY_MARKERS),
                array, max, i,
                position, params;

            array = JSON.parse(string);
            if (array && array.length !== 0) {
                for (i = 0, max = array.length; i < max; i++) {
                    position = new WorldWind.Position(array[i].latitude, array[i].longitude, 0);
                    params = {
                        id: array[i].id,
                        name: array[i].name,
                        imageSource: array[i].source,
                        isMovable: array[i].isMovable
                    };

                    this.addMarker(new BasicMarker(this, position, params));
                }
            }
        };


        MarkerManager.prototype.generateUniqueName = function(marker) {
            var uniqueName = marker.name().trim(),
                otherMarker,
                isUnique,
                suffixes,
                seqNos,
                n, i, len;

            do {
                isUnique = true;

                for (i = 0, len = this.markers().length; i < len; i += 1) {
                    otherMarker = this.markers()[i];
                    if (otherMarker === marker) {
                        continue;
                    }
                    if (otherMarker.name() === uniqueName) {
                        isUnique = false;

                        suffixes = uniqueName.match(/[(]\d+[)]$/);
                        if (suffixes) {
                            seqNos = suffixes[0].match(/\d+/);
                            n = parseInt(seqNos[0], 10) + 1;
                            uniqueName = uniqueName.replace(/[(]\d+[)]$/, '(' + n + ')');
                        } else {
                            uniqueName += ' (2)';
                        }
                        break;
                    }
                }
            } while (!isUnique);

            return uniqueName;
        };

        return MarkerManager;
    }
);