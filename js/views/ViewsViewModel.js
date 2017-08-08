define(['knockout', 'jquery', 'jqueryui', 'bootstrap', 'model/Constants'],
    function(ko, $, jqueryui, boostrap, constants) {
        function ViewsViewModel(globe) {
            var self = this,
                layerManager = globe.layerManager;
            self.effectsLayers = layerManager.effectsLayers;
            self.widgetLayers = layerManager.widgetLayers;
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
        return ViewsViewModel;
    }

);