define(['knockout', 'jquery', 'jqueryui', 'bootstrap', 'model/Constants'],
    function(ko, $, jqueryui, boostrap, constants) {
        function LayersViewModel(globe) {
            var self = this,
                layerManager = globe.layerManager;

            self.baseLayers = layerManager.baseLayers;
            self.overlayLayers = layerManager.overlayLayers;
            self.overlay1Layers = layerManager.overlay1Layers;
            self.dataLayers = layerManager.dataLayers;
            self.optionValues = ["WMS Layer", "WMTS Layer", "KML file", "Shapefile"];
            self.selectedOptionValue = ko.observable(self.optionValues[0]);
            self.curr = ko.observable(0.8);
            self.onToggleLayer = function(layer) {

                layer.enabled(!layer.enabled());
                globe.redraw();
            };
            self.chag = function(data, event, layer) {

                var layerName = event.target.id;
                var layers = globe.wwd.layers,
                    i, len;
                for (i = 0, len = layers.length; i < len; i++) {
                    if (layers[i].displayName === layerName) {
                        layers[i].opacity = data.value;
                        globe.redraw();
                    }
                }
            };

            self.parxm = function(layerName, orgnam, crs, servadd, imgfr, prj, doc) {
                try {
                    var layn = layerName;
                    var xmd = doc;
                    var orgi = orgnam;
                    var srs = crs;
                    var add = servadd;
                    var imfo = imgfr;
                    var proj = prj;
                    var test, property, property1, i, h, text, key = 0,
                        str = " ";
                    var result = [];
                    var prop = [];
                    var propv = [];
                    var serty = "WMS";
                    var users = xmd.getElementsByTagName("Layer");
                    for (var i = 0; i < users.length; i++) {
                        var user = users[i];
                        var names = user.getElementsByTagName("Title");
                        for (var j = 0; j < names.length; j++) {
                            if (names[j].childNodes[0].nodeValue === layn) {
                                var abst = user.getElementsByTagName('Abstract')[0].lastChild.nodeValue;
                                var westb = user.getElementsByTagName('westBoundLongitude')[0].lastChild.nodeValue;
                                var eastb = user.getElementsByTagName('eastBoundLongitude')[0].lastChild.nodeValue;
                                var northb = user.getElementsByTagName('northBoundLatitude')[0].lastChild.nodeValue;
                                var southb = user.getElementsByTagName('southBoundLatitude')[0].lastChild.nodeValue;
                            }
                        }
                    }
                    var my_url = add + 'SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&FORMAT=image/png&TRANSPARENT=true&QUERY_LAYERS=' + orgi + '&STYLES&LAYERS=' + orgi + '&INFO_FORMAT=application/json&FEATURE_COUNT=50&X=50&Y=50&SRS=EPSG:4326&WIDTH=101&HEIGHT=101&BBOX=' + westb + ',' + southb + ',' + eastb + ',' + northb;
                    fetch(my_url)
                        .then(res => res.json())
                        .then((out) => {
                            try {
                                if (out.crs == null) {
                                    str = "Attribute list is not visible for this layer";
                                } else {
                                    property = out.features[0].properties;
                                    property1 = out.features[0].geometry.type;
                                    h = 1;
                                    for (var name in property) {
                                        prop[i] = name;
                                        str = str.concat(h);
                                        str = str.concat(".");
                                        str = str.concat(prop[i]);
                                        str = str.concat("\n");
                                        h++;
                                    }
                                }

                                var $featuredialog = $("#feature")
                                    .html('Data Name : ' + orgi +
                                        '<br>Data Name Alias(wms_title) : ' + layn +
                                        '<br>Feature Type : ' + property1 +
                                        '<br>Projection(wms_srs) : ' + srs +
                                        '<br>Projection(coordsys_name) : ' + proj +
                                        '<br>Source Name : ' + add +
                                        '<br>Web Service Type : ' + serty +
                                        '<br>Imge Format Returned : ' + imfo +
                                        '<br>westBoundLongitude : ' + westb +
                                        '<br>northBoundLatitude : ' + northb +
                                        '<br>southBoundLatitude : ' + southb +
                                        '<br>eastBoundLongitude : ' + eastb +
                                        '<br>----------------------------------------------<br>Description : ' + abst +
                                        '<br>----------------------------------------------<br>Attributes : ' + str
                                    )
                                    .dialog({
                                        autoOpen: false,
                                        title: "MetaData",
                                        width: 600,
                                        height: 'auto'
                                    });
                                $featuredialog.dialog("open").parent(".ui-dialog").css("background", "TRANSPARENT").find(".ui-dialog-content").css("color", "white").prev(".ui-dialog-titlebar").css("background", "grey");

                            } catch (e) {
                                var $featuredialog = $("#feature")
                                    .html('Data Name : ' + orgi +
                                        '<br>Data Name Alias(wms_title) : ' + layn +
                                        '<br>Feature Type : ' + property1 +
                                        '<br>Projection(wms_srs) : ' + srs +
                                        '<br>Projection(coordsys_name) : ' + proj +
                                        '<br>Source Name : ' + add +
                                        '<br>Web Service Type : ' + serty +
                                        '<br>Imge Format Returned : ' + imfo +
                                        '<br>westBoundLongitude : ' + westb +
                                        '<br>northBoundLatitude : ' + northb +
                                        '<br>southBoundLatitude : ' + southb +
                                        '<br>eastBoundLongitude : ' + eastb +
                                        '<br>----------------------------------------------<br>Description : ' + abst +
                                        '<br>----------------------------------------------<br>Attributes : Layers not queryable'
                                    )
                                    .dialog({
                                        autoOpen: false,
                                        title: "MetaData",
                                        width: 600,
                                        height: 'auto'
                                    });
                                $featuredialog.dialog("open").parent(".ui-dialog").css("background", "TRANSPARENT").find(".ui-dialog-content").css("color", "white").prev(".ui-dialog-titlebar").css("background", "grey");
                            }

                        })
                        .catch(function(err) {
                            var $featuredialog = $("#feature")
                                .html('Data Name : ' + orgi +
                                    '<br>Data Name Alias(wms_title) : ' + layn +
                                    '<br>Feature Type : ' + property1 +
                                    '<br>Projection(wms_srs) : ' + srs +
                                    '<br>Projection(coordsys_name) : ' + proj +
                                    '<br>Source Name : ' + add +
                                    '<br>Web Service Type : ' + serty +
                                    '<br>Imge Format Returned : ' + imfo +
                                    '<br>westBoundLongitude : ' + westb +
                                    '<br>northBoundLatitude : ' + northb +
                                    '<br>southBoundLatitude : ' + southb +
                                    '<br>eastBoundLongitude : ' + eastb +
                                    '<br>----------------------------------------------<br>Description : ' + abst +
                                    '<br>----------------------------------------------<br>Attributes : Layers not queryable'
                                )
                                .dialog({
                                    autoOpen: false,
                                    title: "MetaData",
                                    width: 600,
                                    height: 'auto'
                                });
                            $featuredialog.dialog("open").parent(".ui-dialog").css("background", "TRANSPARENT").find(".ui-dialog-content").css("color", "white").prev(".ui-dialog-titlebar").css("background", "grey");
                        })
                } catch (e) {
                    var $featuredialog = $("#feature")
                        .html('Data Name : ' + orgi +
                            '<br>Data Name Alias(wms_title) : ' + layn +
                            '<br>Feature Type : ' + property1 +
                            '<br>Projection(wms_srs) : ' + srs +
                            '<br>Projection(coordsys_name) : ' + proj +
                            '<br>Source Name : ' + add +
                            '<br>Web Service Type : ' + serty +
                            '<br>Imge Format Returned : ' + imfo +
                            '<br>westBoundLongitude : ' + westb +
                            '<br>northBoundLatitude : ' + northb +
                            '<br>southBoundLatitude : ' + southb +
                            '<br>eastBoundLongitude : ' + eastb +
                            '<br>----------------------------------------------<br>Description : ' + abst +
                            '<br>----------------------------------------------<br>Attributes : Layers not queryable'
                        )
                        .dialog({
                            autoOpen: false,
                            title: "MetaData",
                            width: 600,
                            height: 'auto'
                        });
                    $featuredialog.dialog("open").parent(".ui-dialog").css("background", "TRANSPARENT").find(".ui-dialog-content").css("color", "white").prev(".ui-dialog-titlebar").css("background", "grey");
                }


            };


            self.chd = function(data, event, layer) {
                try {

                    var layerName = data.name();
                    var orgnam, crs, servadd, imgfr, prj, wmsCapsDoc;
                    var layers = globe.wwd.layers,
                        i, len;
                    for (i = 0, len = layers.length; i < len; i++) {
                        if (layers[i].displayName === layerName) {
                            orgnam = layers[i].urlBuilder.layerNames;
                            crs = layers[i].urlBuilder.crs;
                            servadd = layers[i].urlBuilder.serviceAddress;
                            imgfr = layers[i].retrievalImageFormat;
                            prj = layers[i].lastGlobeStateKey;
                        }
                    }
                    var asm;
                    asm = servadd + "SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities";

                    var x = new XMLHttpRequest();
                    x.open("GET", asm, true);
                    x.onreadystatechange = function() {
                        if (x.readyState == 4 && x.status == 200) {
                            var doc = x.responseXML;

                            self.parxm(layerName, orgnam, crs, servadd, imgfr, prj, doc);
                        }
                    };
                    x.send(null);
                } catch (e) {
                    var $featuredialog = $("#feature")
                        .html('This layer doesnot have any metadata. Layer doesnot belongs to WMS')
                        .dialog({
                            autoOpen: false,
                            title: "MetaData",
                            width: 500,
                            height: 'auto'
                        });
                    $featuredialog.dialog("open").parent(".ui-dialog").css("background", "TRANSPARENT").find(".ui-dialog-content").css("color", "white").prev(".ui-dialog-titlebar").css("background", "grey");
                }
            };


            self.onEditSettings = function(layer) {

                $('#opacity-slider').slider({
                    animate: 'fast',
                    min: 0,
                    max: 1,
                    orientation: 'horizontal',
                    slide: function(event, ui) {
                        layer.opacity(ui.value);
                    },
                    step: 0.1
                });

                $("#layer-settings-dialog").dialog({
                    autoOpen: false,
                    title: layer.name()
                });
                $("#opacity-slider").slider("option", "value", layer.opacity());
                $("#layer-settings-dialog").dialog("open");
            };

            self.onAddLayer = function() {
                $("#add-layer-dialog").dialog({
                    autoOpen: false,
                    title: "Add Layer"
                });

                $("#add-layer-dialog").dialog("open");
            };

        }

        return LayersViewModel;
    }
);