define(['worldwind'],
    function(ww) {
        "use strict";
        var ShapefileLayer = function(shapefileUrl, layerName, shapeConfigurationCallback) {

            WorldWind.RenderableLayer.call(this, layerName || shapefileUrl);

            this._opacity = 0.25;

            var shapefilePath = shapefileUrl,
                shapefile = new WorldWind.Shapefile(shapefilePath);

            if (shapeConfigurationCallback === undefined) {
                shapeConfigurationCallback = function(attributes, record) {
                    var configuration = {};
                    configuration.name = attributes.values.name || attributes.values.Name || attributes.values.NAME;
                    configuration.attributes = new WorldWind.ShapeAttributes(null);
                    configuration.attributes.interiorColor = new WorldWind.Color(
                        0.375 + 0.5 * Math.random(),
                        0.375 + 0.5 * Math.random(),
                        0.375 + 0.5 * Math.random(),
                        0.25);

                    configuration.attributes.outlineColor = new WorldWind.Color(
                        0.5 * configuration.attributes.interiorColor.red,
                        0.5 * configuration.attributes.interiorColor.green,
                        0.5 * configuration.attributes.interiorColor.blue,
                        0.5);

                    configuration.userProperties = {
                        record: attributes,
                        layer: record.shapefile.layer
                    };

                    return configuration;
                };
            }


            shapefile.load(null, shapeConfigurationCallback, this);


        };

        ShapefileLayer.prototype = Object.create(WorldWind.RenderableLayer.prototype);


        Object.defineProperties(ShapefileLayer.prototype, {
            opacity: {
                get: function() {
                    return this._opacity;
                },
                set: function(value) {
                    this._opacity = value;
                    if (this.renderables) {
                        for (var i = 0, len = this.renderables.length; i < len; i++) {
                            if (this.renderables[i].attributes) {
                                this.renderables[i].attributes.interiorColor.alpha = this._opacity;
                                this.renderables[i].attributes.stateKeyInvalid = true;
                            }
                        }
                    }
                }
            }

        });

        return ShapefileLayer;
    }
);