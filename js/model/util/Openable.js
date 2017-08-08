define([
        'knockout',
        'model/util/Publisher',
        'model/Events'
    ],
    function(ko, publisher, events) {
        "use strict";

        var Openable = {
            open: function(params) {
                if (this.isOpenable()) {
                    if (this.openMe(params)) {
                        this.fire(events.EVENT_OBJECT_OPENED, this);
                    }
                }
            },
            makeOpenable: function(o, openCallback) {
                if (o.open) {
                    return;
                }
                var i;
                for (i in Openable) {
                    if (Openable.hasOwnProperty(i) && typeof Openable[i] === 'function') {
                        if (Openable[i] === this.makeOpenable) {
                            continue;
                        }
                        o[i] = Openable[i];
                    }
                }
                o.isOpenable = ko.observable(true);
                o.openMe = openCallback;

                publisher.makePublisher(o);
            }
        };
        return Openable;
    }
);