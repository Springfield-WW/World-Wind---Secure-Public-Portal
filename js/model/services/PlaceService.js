define(['model/util/Log',
        'model/util/WmtUtil'
    ],
    function(log,
        util) {
        "use strict";
        var PlaceService = {
            places: function(latitude, longitude, callback) {
                var url = 'https://query.yahooapis.com/v1/public/yql',
                    query = 'q=select * from geo.places where ' +
                    'text="(' + latitude + ',' + longitude + ')"' +
                    '&format=json' +
                    '&diagnostics=true' +
                    '&callback=';
                console.log(url + '?' + query);
                $.get(url, query, callback);
            },
            placefinder: function(latitude, longitude, callback) {
                var url = 'https://query.yahooapis.com/v1/public/yql',
                    query = 'q=select * from geo.placefinder where ' +
                    'text="' + latitude + ' ' + longitude + '" and gflags="R"' +
                    '&format=json' +
                    '&diagnostics=true' +
                    '&callback=';
                console.log(url + '?' + query);
                $.get(url, query, callback);
            },
            gazetteer: function(place, callback) {
                var url = 'https://query.yahooapis.com/v1/public/yql',
                    query = 'q=select * from geo.placefinder where ' +
                    'text="' + place + '"' +
                    '&format=json' +
                    '&diagnostics=true' +
                    '&callback=';
                console.log(url + '?' + query);
                $.get(url, query, callback);
            }
        };
        return PlaceService;
    }
);