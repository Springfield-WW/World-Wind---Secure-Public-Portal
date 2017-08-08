define(['model/util/Log'],
    function(log) {
        "use strict";
        var Publisher = {
            subscribers: {
                any: []
            },
            on: function(type, fn, context) {
                if ((typeof type) === 'undefined') {
                    var caller_line = (new Error()).stack.split("\n")[4];
                    log.error('Publisher', 'on', 'type arg is "undefined", is this really the intent? ' + caller_line);
                }
                type = type || 'any';
                fn = (typeof fn === "function") ? fn : context[fn];

                if ((typeof this.subscribers[type]) === 'undefined') {
                    this.subscribers[type] = [];
                }
                this.subscribers[type].push({
                    fn: fn,
                    context: context || this
                });
            },
            cancelSubscription: function(type, fn, context) {
                this.visitSubscribers('unsubscribe', type, fn, context);
            },
            fire: function(type, publication) {
                if ((typeof type) === 'undefined') {
                    throw new TypeError(log.error('Publisher', 'fire', 'Event type is "undefined".'));
                }
                this.visitSubscribers('publish', type, publication);
            },
            visitSubscribers: function(action, type, arg, context) {
                var pubtype = type || 'any',
                    subscribers = this.subscribers[pubtype],
                    i,
                    max = subscribers ? subscribers.length : 0;

                for (i = 0; i < max; i += 1) {
                    if (action === 'publish') {
                        subscribers[i].fn.call(subscribers[i].context, arg);
                    } else {
                        if (subscribers[i].fn === arg && subscribers[i].context === context) {
                            subscribers.splice(i, 1);
                        }
                    }
                }
            },
            makePublisher: function(o) {
                if (o.subscribers) {
                    return;
                }
                var i;
                for (i in Publisher) {
                    if (Publisher.hasOwnProperty(i) && typeof Publisher[i] === 'function') {
                        o[i] = Publisher[i];
                    }
                }
                o.subscribers = {
                    any: []
                };
            }
        };
        return Publisher;
    }
);