define([
        'knockout',
        'model/util/Publisher',
        'model/Events'
    ],
    function(ko, publisher, events) {
        "use strict";

        var Selectable = {
            select: function(params) {
                if (this.isSelectable()) {
                    if (this.selectMe(params)) {
                        this.fire(events.EVENT_OBJECT_SELECTED, this);
                    }
                }
            },
            makeSelectable: function(o, selectCallback) {
                if (o.select) {
                    return;
                }
                var i;
                for (i in Selectable) {
                    if (Selectable.hasOwnProperty(i) && typeof Selectable[i] === 'function') {
                        if (Selectable[i] === this.makeSelectable) {
                            continue;
                        }
                        o[i] = Selectable[i];
                    }
                }
                o.isSelectable = ko.observable(true);
                o.selectMe = selectCallback;

                publisher.makePublisher(o);
            }
        };
        return Selectable;
    }
);