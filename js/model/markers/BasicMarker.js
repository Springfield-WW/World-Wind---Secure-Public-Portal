define([
        'knockout',
        'jquery',
        'jquery-growl',
        'model/Constants',
        'model/util/ContextSensitive',
        'model/Events',
        'model/util/Formatter',
        'model/util/Openable',
        'model/util/Log',
        'model/util/Movable',
        'model/services/PlaceService',
        'model/util/Removable',
        'model/util/Selectable',
        'model/util/WmtUtil',
        'worldwind'
    ],
    function(ko,
        $,
        growl,
        constants,
        contextSensitive,
        events,
        formatter,
        openable,
        log,
        movable,
        placeService,
        removable,
        selectable,
        util) {
        "use strict";

        var BasicMarker = function(manager, position, params) {
            var self = this,
                args = params || {},
                normalAttributes, highlightAttributes, placemark;

            this.globe = manager.globe;



            movable.makeMovable(this);

            selectable.makeSelectable(this, function(params) {
                this.isMovable(params.selected);
                this.placemark.highlighted = params.selected;
                return true;
            });

            openable.makeOpenable(this, function() {
                var $editor = $("#marker-editor"),
                    markerEditor = ko.dataFor($editor.get(0));
                markerEditor.open(this);
                return true;
            });

            removable.makeRemovable(this, function() {
                manager.removeMarker(self);
                return true;
            });

            contextSensitive.makeContextSensitive(this, function() {
                $.growl({
                    title: self.name(),
                    message: "Location: " + self.toponym() + ", " + self.location()
                });
            });


            this.id = ko.observable(args.id || util.guid());
            this.name = ko.observable(args.name || "Marker");
            this.isMovable(args.isMovable === undefined ? false : args.isMovable);
            this.latitude(position.latitude)
            this.longitude(position.longitude);
            this.location = ko.computed(function() {
                return formatter.formatDecimalDegreesLat(self.latitude(), 3) + ", " + formatter.formatDecimalDegreesLon(self.longitude(), 3);
            });
            this.toponym = ko.observable("");


            this.source = args.imageSource;
            this.viewTemplateName = 'basic-marker-view-template';


            normalAttributes = new WorldWind.PlacemarkAttributes(BasicMarker.commonAttributes());
            if (args.imageSource) {
                normalAttributes.imageSource = args.imageSource;
            } else {
                normalAttributes.imageScale = 20;
                normalAttributes.imageOffset = new WorldWind.Offset(
                    WorldWind.OFFSET_FRACTION, 0.5,
                    WorldWind.OFFSET_FRACTION, 0.5);
            }
            highlightAttributes = new WorldWind.PlacemarkAttributes(normalAttributes);
            highlightAttributes.imageScale = normalAttributes.imageScale * 1.2;

            this.placemark = new WorldWind.Placemark(position, true, normalAttributes);
            this.placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
            this.placemark.eyeDistanceScalingThreshold = 2000000;
            this.placemark.highlightAttributes = highlightAttributes;
            this.placemark.label = this.name();
            this.placemark.pickDelegate = this;


            this.name.subscribe(function(newName) {
                self.placemark.label = newName;
            });
            this.latitude.subscribe(function(newLat) {
                self.placemark.position.latitude = newLat;
            });
            this.longitude.subscribe(function(newLon) {
                self.placemark.position.longitude = newLon;
            });

            this.on(events.EVENT_OBJECT_MOVE_FINISHED, this.refresh);

            this.refresh();
        };


        BasicMarker.prototype.refresh = function() {
            this.refreshPlace();
        };

        BasicMarker.prototype.refreshPlace = function(deferred) {

            if (!this.latitude() || !this.longitude()) {
                return;
            }
            var self = this,
                i, max, item,
                places = [],
                placename = '',
                placeResults;

            placeService.places(
                this.latitude(),
                this.longitude(),
                function(json) {

                    if (!json.query.results) {
                        log.error("BasicMarker", "refreshPlace", "json.query.results is null");
                        return;
                    }
                    placeResults = (json.query.count === 1 ? [json.query.results.place] : json.query.results.place);
                    for (i = 0, max = placeResults.length; i < max; i++) {
                        item = placeResults[i];
                        places[i] = {
                            name: item.name,
                            placeType: item.placeTypeName.content,
                        };
                    };
                    self.places = places;

                    for (i = 0, max = places.length; i < max; i++) {
                        if (places[i].type !== "Zip Code") {
                            placename = places[i].name;
                            break;
                        }
                    }
                    self.toponym(placename);

                    log.info('BasicMarker', 'refreshPlace', self.name() + ': EVENT_PLACE_CHANGED');
                    self.fire(events.EVENT_PLACE_CHANGED, self);
                    if (deferred) {
                        deferred.resolve(self);
                    }
                }
            );
        };


        BasicMarker.commonAttributes = function() {
            var attributes = new WorldWind.PlacemarkAttributes(null);

            attributes.depthTest = true;
            attributes.imageScale = 0.7;
            attributes.imageColor = WorldWind.Color.WHITE;
            attributes.imageOffset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.3,
                WorldWind.OFFSET_FRACTION, 0.0);
            attributes.labelAttributes.color = WorldWind.Color.YELLOW;
            attributes.labelAttributes.offset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.5,
                WorldWind.OFFSET_FRACTION, 1.0);
            attributes.labelAttributes.color = WorldWind.Color.WHITE;
            attributes.labelAttributes.depthTest = true;
            attributes.drawLeaderLine = true;
            attributes.leaderLineAttributes.outlineColor = WorldWind.Color.RED;
            attributes.leaderLineAttributes.outlineWidth = 2;
            return attributes;
        };

        BasicMarker.imagePath = constants.WORLD_WIND_PATH + 'images/pushpins/';
        BasicMarker.templates = [{
            name: "Red ",
            imageSource: BasicMarker.imagePath + "castshadow-red.png"
        }, {
            name: "Black ",
            imageSource: BasicMarker.imagePath + "castshadow-black.png"
        }, {
            name: "Green ",
            imageSource: BasicMarker.imagePath + "castshadow-green.png"
        }, {
            name: "Blue ",
            imageSource: BasicMarker.imagePath + "castshadow-blue.png"
        }, {
            name: "Teal ",
            imageSource: BasicMarker.imagePath + "castshadow-teal.png"
        }, {
            name: "Orange ",
            imageSource: BasicMarker.imagePath + "castshadow-orange.png"
        }, {
            name: "Purple ",
            imageSource: BasicMarker.imagePath + "castshadow-purple.png"
        }, {
            name: "Brown ",
            imageSource: BasicMarker.imagePath + "castshadow-brown.png"
        }, {
            name: "White ",
            imageSource: BasicMarker.imagePath + "castshadow-white.png"
        }];

        return BasicMarker;
    }
);