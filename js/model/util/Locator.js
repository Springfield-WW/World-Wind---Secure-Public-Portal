define(['jquery',
        'model/Explorer'
    ],
    function($, explorer) {
        "use strict";
        var Locator = {
            locateCurrentPosition: function() {
                if (!window.navigator.geolocation) {
                    $.growl.warning({
                        title: "Locate Not Supported",
                        message: "Sorry, your system doesn't support GeoLocation."
                    });
                    return;
                }

                $.growl({
                    title: "Locating...",
                    message: "Setting your location."
                });

                window.navigator.geolocation.getCurrentPosition(
                    function(position) {
                        explorer.lookAtLatLon(
                            position.coords.latitude,
                            position.coords.longitude);
                    },
                    function(error) {
                        var reason, messageText;
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                reason = "User denied the request for Geolocation.";
                                break;
                            case error.POSITION_UNAVAILABLE:
                                reason = "Location information is unavailable.";
                                break;
                            case error.TIMEOUT:
                                reason = "The request to get user location timed out.";
                                break;
                            case error.UNKNOWN_ERROR:
                                reason = "An unknown error occurred in Geolocation.";
                                break;
                            default:
                                reason = "An unhandled error occurred in Geolocation.";
                        }
                        messageText = "<h3>Sorry. " + reason + "</h3>" +
                            "<p>Details: " + error.message + "</p>";
                        $.growl({
                            message: messageText
                        });

                    });
            }
        };

        return Locator;
    }
);