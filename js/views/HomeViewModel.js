define(['knockout',
        'jquery',
        'model/Constants'
    ],
    function(ko, $, constants) {
        function HomeViewModel(globe) {
            var self = this,
                layerManager = globe.layerManager;

            this.globe = globe;
            this.timeZoneDetectEnabled = globe.timeZoneDetectEnabled;
            this.use24Time = globe.use24Time;
            this.servers = layerManager.servers;
            self.serverAddress = ko.observable("http://geospatial.springfield-or.gov/cgi-bin/mapserv?map=WorldWind.map&");
            self.onAddServer = function() {
                layerManager.addServer(self.serverAddress());
                return true;
            };
            this.onServerLayerClicked = function(layerNode, event) {
                if (!layerNode.isChecked()) {
                    layerManager.addLayerFromCapabilities(layerNode.layerCaps, constants.LAYER_CATEGORY_OVERLAY);
                    blink("ul:first > li:nth-child(2)", 5, 100);
                } else {
                    layerManager.removeLayer(layerNode.layerCaps);
                }
                return true;

            };
            layerManager.addServer("http://geospatial.springfield-or.gov/geoserver/BASE_WMS/wms?");
            layerManager.addServer("http://geospatial.springfield-or.gov/geoserver/FAC_WMS/wms?");
            layerManager.addServer("http://geospatial.springfield-or.gov/geoserver/topp/wms?");
        }

        return HomeViewModel;
    }
);

function blink(elem, times, speed) {
    if (times > 0 || times < 0) {
        if ($(elem).hasClass("blink"))
            $(elem).removeClass("blink");
        else
            $(elem).addClass("blink");
    }

    clearTimeout(function() {
        blink(elem, times, speed);
    });

    if (times > 0 || times < 0) {
        setTimeout(function() {
            blink(elem, times, speed);
        }, speed);
        times -= .5;
    }
}