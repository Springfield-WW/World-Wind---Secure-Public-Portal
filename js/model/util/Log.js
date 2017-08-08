define([],
    function() {
        "use strict";
        var Log = {
            error: function(className, functionName, message) {
                var msg = this.makeMessage(className, functionName, message);
                console.error(msg);
                return msg;
            },
            warning: function(className, functionName, message) {
                var msg = this.makeMessage(className, functionName, message);
                console.warn(msg);
                return msg;
            },
            info: function(className, functionName, message) {
                var msg = this.makeMessage(className, functionName, message);
                console.info(msg);
                return msg;
            },
            makeMessage: function(className, functionName, message) {
                var msg = this.messageTable[message] || message;

                return className + (functionName ? "." : "") + functionName + ": " + msg;
            },
            messageTable: {
                constructor: "Constructing the object.",
                missingTerrain: "The specified terrain is null or undefined."
            }
        };
        return Log;
    }

);