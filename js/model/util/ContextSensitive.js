define([
        'knockout',
        'model/util/Publisher'
    ],
    function(ko, publisher) {
        "use strict";

        var ContextSensitive = {
            showContextMenu: function(params) {
                if (this.isContextSensitive()) {
                    this.showMyContextMenu(params);
                }
            },
            makeContextSensitive: function(o, contextMenuCallback) {
                if (o.showContextMenu) {
                    return;
                }
                var i;
                for (i in ContextSensitive) {
                    if (ContextSensitive.hasOwnProperty(i) && typeof ContextSensitive[i] === 'function') {
                        if (ContextSensitive[i] === this.makeContextSensitive) {
                            continue;
                        }
                        o[i] = ContextSensitive[i];
                    }
                }
                o.isContextSensitive = ko.observable(true);
                o.showMyContextMenu = contextMenuCallback;

                publisher.makePublisher(o);
            }
        };
        return ContextSensitive;
    }
);