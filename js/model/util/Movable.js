define(['knockout',
        'model/util/Publisher',
        'model/util/WmtUtil',
        'model/Events'
    ],
    function(ko,
        publisher,
        utils,
        events) {
        "use strict";
        var Movable = {
            moveStarted: function() {
                if (this.isMovable) {
                    this.fire(events.EVENT_OBJECT_MOVE_STARTED, this);
                }
            },
            moveToLatLon: function(latitude, longitude) {
                if (this.isMovable) {
                    if (ko.isObservable(this.latitude)) {
                        this.latitude(latitude);
                    } else {
                        this.latitude = latitude;
                    }
                    if (ko.isObservable(this.longitude)) {
                        this.longitude(longitude);
                    } else {
                        this.longitude = longitude;
                    }
                    this.fire(events.EVENT_OBJECT_MOVED, this);
                }
            },
            moveFinished: function() {
                if (this.isMovable) {
                    this.fire(events.EVENT_OBJECT_MOVE_FINISHED, this);
                }
            },
            makeMovable: function(o) {
                if (o.moveToLatLon) {
                    return;
                }
                var i;
                for (i in Movable) {
                    if (Movable.hasOwnProperty(i) && typeof Movable[i] === 'function') {
                        if (Movable[i] === this.makeMovable) {
                            continue;
                        }
                        o[i] = Movable[i];
                    }
                }
                o.isMovable = ko.observable(true);
                if (typeof o.latitude === 'undefined') {
                    o.latitude = ko.observable();
                }
                if (typeof o.longitude === 'undefined') {
                    o.longitude = ko.observable();
                }
                publisher.makePublisher(o);
            }
        };
        return Movable;
    }
);