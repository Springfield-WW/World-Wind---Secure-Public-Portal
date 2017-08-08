define(['knockout', 'model/Config', 'model/Constants', 'worldwind'],
    function(ko,
        config,
        constants,
        ww) {
        "use strict";
        var LayerManager = function(globe) {
            var self = this;

            this.globe = globe;


            this.backgroundLayers = ko.observableArray();

            this.baseLayers = ko.observableArray();

            this.overlayLayers = ko.observableArray();

            this.overlay1Layers = ko.observableArray();

            this.effectsLayers = ko.observableArray();

            this.dataLayers = ko.observableArray();

            this.widgetLayers = ko.observableArray();

            this.servers = ko.observableArray();

            this.toggleLayer = function(layer) {
                layer.enabled = !layer.enabled;

                layer.layerEnabled(layer.enabled);

                self.globe.redraw();
            };

        };

        LayerManager.prototype.addBackgroundLayer = function(layer) {
            var index = this.backgroundLayers().length;

            LayerManager.applyOptionsToLayer(layer, {
                hideInMenu: true,
                enabled: true
            }, constants.LAYER_CATEGORY_BACKGROUND);

            this.globe.wwd.insertLayer(index, layer);

            this.backgroundLayers.push(LayerManager.createLayerViewModel(layer));
        };

        LayerManager.prototype.loadDefaultLLayers = function() {
            this.addBaseLayer(new WorldWind.BMNGLayer(), {
                enabled: true,
                hideInMenu: true,
                detailHint: config.imageryDetailHint
            });
            this.addBaseLayer(new WorldWind.BMNGLandsatLayer(), {
                enabled: false,
                detailHint: config.imageryDetailHint
            });
            this.addBaseLayer(new WorldWind.BingAerialWithLabelsLayer(null), {
                enabled: false,
                detailHint: config.imageryDetailHint
            });
            this.addBaseLayer(new WorldWind.BingRoadsLayer(null), {
                enabled: true,
                opacity: 0.7,
                detailHint: config.imageryDetailHint
            });

            this.addDataLayer(new WorldWind.RenderableLayer(constants.LAYER_NAME_MARKERS), {
                enabled: true,
                pickEnabled: true
            });
        };
        LayerManager.prototype.addBaseLayer = function(layer, options) {
            var index = this.backgroundLayers().length + this.baseLayers().length;

            LayerManager.applyOptionsToLayer(layer, options, constants.LAYER_CATEGORY_BASE);

            this.globe.wwd.insertLayer(index, layer);

            this.baseLayers.push(LayerManager.createLayerViewModel(layer));
        };

        LayerManager.prototype.addOverlayLayer = function(layer, options) {
            var index = this.backgroundLayers().length + this.baseLayers().length + this.overlayLayers().length;

            LayerManager.applyOptionsToLayer(layer, options, constants.LAYER_CATEGORY_OVERLAY);

            this.globe.wwd.insertLayer(index, layer);

            this.overlayLayers.push(LayerManager.createLayerViewModel(layer));
        };

        LayerManager.prototype.addOverlay1Layer = function(layer, options) {
            var index = this.backgroundLayers().length + this.baseLayers().length + this.overlay1Layers().length;

            LayerManager.applyOptionsToLayer(layer, options, constants.LAYER_CATEGORY_OVERLAY);

            this.globe.wwd.insertLayer(index, layer);

            this.overlay1Layers.push(LayerManager.createLayerViewModel(layer));
        };

        LayerManager.prototype.addEffectLayer = function(layer, options) {
            var index = this.backgroundLayers().length + this.baseLayers().length + this.overlayLayers().length + this.overlay1Layers().length + this.effectsLayers().length;

            LayerManager.applyOptionsToLayer(layer, options, constants.LAYER_CATEGORY_EFFECT);

            this.globe.wwd.insertLayer(index, layer);

            this.effectsLayers.push(LayerManager.createViewsViewModel(layer));
        };

        LayerManager.prototype.addDataLayer = function(layer, options) {
            var index = this.backgroundLayers().length + this.baseLayers().length + this.overlayLayers().length + this.overlay1Layers().length + this.effectsLayers().length +
                this.dataLayers().length;

            LayerManager.applyOptionsToLayer(layer, options, constants.LAYER_CATEGORY_DATA);

            this.globe.wwd.insertLayer(index, layer);

            this.dataLayers.push(LayerManager.createLayerViewModel(layer));
        };

        LayerManager.prototype.addWidgetLayer = function(layer) {
            var index = this.backgroundLayers().length + this.baseLayers().length + this.overlayLayers().length + this.overlay1Layers().length + this.effectsLayers().length +
                this.dataLayers().length + this.widgetLayers().length;

            LayerManager.applyOptionsToLayer(layer, {
                hideInMenu: true,
                enabled: true
            }, constants.LAYER_CATEGORY_BACKGROUND);

            this.globe.wwd.insertLayer(index, layer);
            this.widgetLayers.push(LayerManager.createViewsViewModel(layer));
        };

        LayerManager.prototype.findLayer = function(layerName) {
            var layers = this.globe.wwd.layers,
                i, len;

            if (!layerName) {
                return null;
            }

            for (i = 0, len = layers.length; i < len; i++) {
                if (layers[i].displayName === layerName) {
                    return layers[i];
                }
            }
            return null;
        };


        LayerManager.applyOptionsToLayer = function(layer, options, category) {
            var opt = (options === undefined) ? {} : options;

            layer.category = category;

            layer.enabled = opt.enabled === undefined ? true : opt.enabled;
            layer.pickEnabled = opt.pickEnabled === undefined ? false : opt.enabled;

            if (opt.isTemporal) {
                layer.isTemporal = true;
            }

            if (opt.detailHint) {
                layer.detailHint = opt.detailHint;
            }

            if (opt.opacity) {
                layer.opacity = opt.opacity;
            }

            layer.showInMenu = ko.observable(opt.hideInMenu === undefined ? true : !opt.hideInMenu);

        };

        LayerManager.nextLayerId = 0;
        LayerManager.createLayerViewModel = function(layer) {
            var viewModel = {
                id: ko.observable(LayerManager.nextLayerId++),
                category: ko.observable(layer.category),
                name: ko.observable(layer.displayName),
                enabled: ko.observable(layer.enabled),
                legendUrl: ko.observable(layer.legendUrl ? layer.legendUrl.url : ''),
                opacity: ko.observable(layer.opacity)
            };
            viewModel.enabled.subscribe(function(newValue) {
                layer.enabled = newValue;
            });
            viewModel.opacity.subscribe(function(newValue) {
                layer.opacity = newValue;
            });

            return viewModel;
        };
        LayerManager.createViewsViewModel = function(layer) {
            var viewModel = {
                id: ko.observable(LayerManager.nextLayerId++),
                category: ko.observable(layer.category),
                name: ko.observable(layer.displayName),
                enabled: ko.observable(layer.enabled),
                legendUrl: ko.observable(layer.legendUrl ? layer.legendUrl.url : ''),
                opacity: ko.observable(layer.opacity)
            };
            viewModel.enabled.subscribe(function(newValue) {
                layer.enabled = newValue;
            });
            viewModel.opacity.subscribe(function(newValue) {
                layer.opacity = newValue;
            });

            return viewModel;
        };
        LayerManager.prototype.removeLayerViewModel = function(layerCaps) {

            var sa = layerCaps.title;
            this.overlayLayers.remove(function(viewModel) {
                return viewModel.name() == sa
            });
            this.overlay1Layers.remove(function(viewModel) {
                return viewModel.name() == sa
            });
        }
        LayerManager.prototype.addServer = function(serverAddress) {
            if (!serverAddress) {
                return;
            }

            serverAddress = serverAddress.trim();
            serverAddress = serverAddress.replace("Http", "http");
            if (serverAddress.lastIndexOf("http", 0) != 0) {
                serverAddress = "http://" + serverAddress;
            }

            var self = this,
                request = new XMLHttpRequest(),
                url = WorldWind.WmsUrlBuilder.fixGetMapString(serverAddress);

            url += "service=WMS&request=GetCapabilities&version=1.3.0";

            request.open("GET", url, true);
            request.onreadystatechange = function() {
                if (request.readyState === 4 && request.status === 200) {
                    var xmlDom = request.responseXML,
                        wmsCapsDoc;

                    if (!xmlDom && request.responseText.indexOf("<?xml") === 0) {
                        xmlDom = new window.DOMParser().parseFromString(request.responseText, "text/xml");
                    }

                    if (!xmlDom) {
                        alert(serverAddress + " retrieval failed. It is probably not a WMS server.");
                        return;
                    }

                    wmsCapsDoc = new WorldWind.WmsCapabilities(xmlDom);

                    if (wmsCapsDoc.version) {

                        self.servers.push(self.loadServerCapabilites(serverAddress, wmsCapsDoc));

                    } else {
                        alert(serverAddress +
                            " WMS capabilities document invalid. The server is probably not a WMS server.");
                    }
                } else if (request.readyState === 4) {
                    if (request.statusText) {
                        alert(request.responseURL + " " + request.status + " (" + request.statusText + ")");
                    } else {
                        alert("Failed to retrieve WMS capabilities from " + serverAddress + ".");
                    }
                }
            };

            request.send(null);
        };



        LayerManager.nextServerId = 0;
        LayerManager.prototype.loadServerCapabilites = function(serverAddress, wmsCapsDoc) {
            var wmsService = wmsCapsDoc.service,
                wmsLayers = wmsCapsDoc.capability.layers,
                server = {
                    id: LayerManager.nextServerId++,
                    address: serverAddress,
                    service: wmsService,
                    title: ko.observable(wmsService.title && wmsService.title.length > 0 ? wmsService.title : serverAddress),
                    layers: ko.observableArray()
                },
                result, i, numLayers;


            if ((wmsLayers.length === 1) && (wmsLayers[0].layers) &&
                (wmsLayers[0].title === wmsCapsDoc.service.title) && !(wmsLayers[0].name && wmsLayers[0].name.length > 0)) {
                wmsLayers = wmsLayers[0].layers;
            }

            this.assembleLayers(wmsLayers, server.layers);

            return server;
        };

        LayerManager.prototype.assembleLayers = function(wmsLayers, layerNodes) {

            for (var i = 0; i < wmsLayers.length; i++) {
                var layer = wmsLayers[i],
                    isLayer = ko.observable(layer.name && layer.name.length > 0 || false),
                    node = {
                        title: layer.title,
                        abstract: layer.abstract,
                        layerCaps: layer,
                        isChecked: ko.observable(false),
                        isFolder: !isLayer,
                        isLayer: isLayer,
                        layers: ko.observableArray()
                    };

                if (layer.layers && layer.layers.length > 0) {
                    this.assembleLayers(layer.layers, node.layers);
                }

                layerNodes.push(node);
            }

            return layerNodes;
        };

        LayerManager.prototype.addLayerFromCapabilities = function(layerCaps, category) {
            if (layerCaps.name) {
                var config = WorldWind.WmsLayer.formLayerConfiguration(layerCaps, null);
                var layer;

                if (config.timeSequences &&
                    (config.timeSequences[config.timeSequences.length - 1] instanceof WorldWind.PeriodicTimeSequence)) {
                    var timeSequence = config.timeSequences[config.timeSequences.length - 1];
                    config.levelZeroDelta = new WorldWind.Location(180, 180);
                    layer = new WorldWind.WmsTimeDimensionedLayer(config);
                    layer.opacity = 0.8;
                    layer.time = timeSequence.startTime;
                    layer.timeSequence = timeSequence;


                } else if (config.timeSequences &&
                    (config.timeSequences[config.timeSequences.length - 1] instanceof Date)) {
                    timeSequence = config.timeSequences[config.timeSequences.length - 1];
                    config.levelZeroDelta = new WorldWind.Location(180, 180);
                    layer = new WorldWind.WmsTimeDimensionedLayer(config);
                    layer.opacity = 0.8;
                    layer.time = config.timeSequences[0];
                    layer.timeSequence = timeSequence;
                } else {
                    layer = new WorldWind.WmsLayer(config, null);
                }

                if (layerCaps.styles && layerCaps.styles.length > 0 &&
                    layerCaps.styles[0].legendUrls && layerCaps.styles[0].legendUrls.length > 0) {
                    layer.legendUrl = layerCaps.styles[0].legendUrls[0];
                }

                layer.enabled = true;
                if (category === constants.LAYER_CATEGORY_BASE) {
                    this.addBaseLayer(layer);
                } else if (category === constants.LAYER_CATEGORY_OVERLAY) {
                    if (layer.legendUrl.url.includes("10.9.3.238")) {
                        this.addOverlayLayer(layer);
                    } else {
                        this.addOverlay1Layer(layer);
                    }

                } else if (category === constants.LAYER_CATEGORY_DATA) {
                    this.addDataLayer(layer);
                } else {

                    this.addBaseLayer(layer);
                }

                return layer;
            }

            return null;
        };

        LayerManager.prototype.removeLayer = function(layerCaps) {
            this.removeLayerViewModel(layerCaps);
            this.globe.wwd.removeLayer(layerCaps);
            if (this.timeSeriesPlayer && this.timeSeriesPlayer.layer === layerCaps) {
                this.timeSeriesPlayer.timeSequence = null;
                this.timeSeriesPlayer.layer = null;
            }

            this.globe.redraw();
        };

        return LayerManager;
    }
);