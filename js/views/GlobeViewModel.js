define(['knockout', 'jquery', 'jqueryui',
        'model/markers/BasicMarker',
        'model/Config',
        'model/Constants',
        'model/Explorer',
        'model/util/WmtUtil',
        'worldwind'
    ],
    function(ko, $, jqueryui,
        BasicMarker,
        config,
        constants,
        explorer,
        util,
        ww) {
        "use strict";

        function GlobeViewModel(globe, markerManager) {
            var self = this,
                commonAttributes = BasicMarker.commonAttributes();

            self.autoUpdateTime = explorer.autoUpdateTimeEnabled;
            self.markerPalette = ko.observableArray(BasicMarker.templates);
            self.selectedMarkerTemplate = ko.observable(self.markerPalette()[0]);
            self.dropIsArmed = ko.observable(false);
            self.dropCallback = null;
            self.dropObject = null;

            self.armDropMarker = function() {
                self.dropIsArmed(true);
                self.dropCallback = self.dropMarkerCallback;
                self.dropObject = self.selectedMarkerTemplate();
            };

            self.selectedMarkerTemplate.subscribe(self.armDropMarker);

            self.dropMarkerCallback = function(position, markerTemplate) {
                markerManager.addMarker(new BasicMarker(
                    markerManager, position, {
                        imageSource: markerTemplate.imageSource
                    }));
            };
            self.handleDropClick = function(event) {
                if (!self.dropIsArmed()) {
                    return;
                }
                var type = event.type,
                    x, y,
                    pickList,
                    terrain;
                switch (type) {
                    case 'click':
                        x = event.clientX;
                        y = event.clientY;
                        break;
                    case 'touchend':
                        if (!event.changedTouches[0]) {
                            return;
                        }
                        x = event.changedTouches[0].clientX;
                        y = event.changedTouches[0].clientY;
                        break;
                }
                if (self.dropCallback) {
                    pickList = globe.wwd.pickTerrain(globe.wwd.canvasCoordinates(x, y));
                    terrain = pickList.terrainObject();
                    if (terrain) {
                        self.dropCallback(terrain.position, self.dropObject);
                    }
                }
                self.dropIsArmed(false);
                event.stopImmediatePropagation();
            };
            globe.wwd.addEventListener('click', function(event) {
                self.handleDropClick(event);
            });


            self.onTimeReset = function() {
                explorer.autoUpdateTimeEnabled(true);
                globe.updateDateTime(new Date());
            };

            self.intervalMinutes = 0;
            self.changeDateTime = function() {
                explorer.autoUpdateTimeEnabled(false);
                globe.incrementDateTime(self.intervalMinutes);
            };

            var intervalId = -1;
            $(".repeatButton").mousedown(function(event) {
                switch (event.currentTarget.id) {
                    case "time-step-forward":
                        self.intervalMinutes = 60;
                        break;
                    case "time-fast-forward":
                        self.intervalMinutes = 60 * 24;
                        break;
                    case "time-step-backward":
                        self.intervalMinutes = -60;
                        break;
                    case "time-fast-backward":
                        self.intervalMinutes = -60 * 24;
                        break;
                }
                self.changeDateTime();
                if (intervalId !== -1) {
                    clearInterval(intervalId);
                }
                intervalId = setInterval(self.changeDateTime, 200);
            }).mouseup(function() {
                clearInterval(intervalId);
                intervalId = -1;
            });

            $('#timeControlSlider').slider({
                animate: 'fast',
                min: -60,
                max: 60,
                orientation: 'horizontal',
                stop: function() {
                    $("#timeControlSlider").slider("value", "0");
                }
            });

            this.onSlide = function(event, ui) {
                explorer.autoUpdateTimeEnabled(false);
                globe.incrementDateTime(ui.value);
                globe.updateDateTime(self.sliderValueToTime(ui.value));
            };
            self.sliderValueToTime = function(value) {
                var time = globe.dateTime(),
                    minutes = time.getMinutes();
                time.setTime(time.getTime() + (value * 60000));
                return time;
            };
            self.sliderValueToMinutes = function(value) {
                var val, factor = 50;
                if (value < 45 && value > -45) {
                    val = Math.min(Math.max(value, -45), 45);
                    return Math.sin(val * util.DEG_TO_RAD) * factor;
                }
                val = Math.abs(value) - 44;
                return Math.pow(val, 1.5) * (value < 0 ? -1 : 1) * factor;
            };

            $("#timeControlSlider").on('slide', $.proxy(this.onSlide, this));

            self.timeSliderValue = ko.observable(0);
            self.onTimeSliderStop = function() {
                self.timeSliderValue(0);
            };
        }

        return GlobeViewModel;
    }
);