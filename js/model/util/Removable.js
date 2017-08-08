define([
        'knockout',
        'model/util/Publisher',
        'model/Events'
    ],
    function(
        ko,
        publisher,
        events) {
        "use strict";
        var Removable = {
            remove: function() {
                if (this.isRemovable()) {
                    if (this.removeMe()) {
                        this.fire(events.EVENT_OBJECT_REMOVED, this);
                    }
                }
            },
            makeRemovable: function(o, removeCallback) {
                if (o.removeMe) {
                    return;
                }
                var i;
                for (i in Removable) {
                    if (Removable.hasOwnProperty(i) && typeof Removable[i] === 'function') {
                        if (Removable[i] === this.makeRemovable) {
                            continue;
                        }
                        o[i] = Removable[i];
                    }
                }
                o.isRemovable = ko.observable(true);
                o.removeMe = removeCallback;

                publisher.makePublisher(o);
            }
        };
        return Removable;
    }
);