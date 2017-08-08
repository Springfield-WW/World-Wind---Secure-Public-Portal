function Colour() {

    this.getIntegerRGB = function() {

        var rgb = this.getRGB();

        // return the integer components
        return {
            'r': Math.round(rgb.r),
            'g': Math.round(rgb.g),
            'b': Math.round(rgb.b),
            'a': rgb.a
        };

    };
    this.getPercentageRGB = function() {

        var rgb = this.getRGB();

        return {
            'r': 100 * rgb.r / 255,
            'g': 100 * rgb.g / 255,
            'b': 100 * rgb.b / 255,
            'a': rgb.a
        };

    };

    this.getCSSHexadecimalRGB = function() {

        var rgb = this.getIntegerRGB();

        var r16 = rgb.r.toString(16);
        var g16 = rgb.g.toString(16);
        var b16 = rgb.b.toString(16);

        return '#' +
            (r16.length == 2 ? r16 : '0' + r16) +
            (g16.length == 2 ? g16 : '0' + g16) +
            (b16.length == 2 ? b16 : '0' + b16);

    };
    this.getCSSIntegerRGB = function() {

        var rgb = this.getIntegerRGB();

        return 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';

    };

    this.getCSSIntegerRGBA = function() {

        var rgb = this.getIntegerRGB();

        return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + rgb.a + ')';

    };
    this.getCSSPercentageRGB = function() {

        var rgb = this.getPercentageRGB();
        return 'rgb(' + rgb.r + '%,' + rgb.g + '%,' + rgb.b + '%)';

    };
    this.getCSSPercentageRGBA = function() {

        var rgb = this.getPercentageRGB();
        return 'rgba(' + rgb.r + '%,' + rgb.g + '%,' + rgb.b + '%,' + rgb.a + ')';

    };

    this.getCSSHSL = function() {

        var hsl = this.getHSL();

        return 'hsl(' + hsl.h + ',' + hsl.s + '%,' + hsl.l + '%)';

    };

    this.getCSSHSLA = function() {

        var hsl = this.getHSL();

        return 'hsla(' + hsl.h + ',' + hsl.s + '%,' + hsl.l + '%,' + hsl.a + ')';

    };

    this.setNodeColour = function(node) {

        node.style.color = this.getCSSHexadecimalRGB();

    };
    this.setNodeBackgroundColour = function(node) {

        node.style.backgroundColor = this.getCSSHexadecimalRGB();

    };

}

RGBColour.prototype = new Colour();

function RGBColour(r, g, b, a) {

    var alpha = (a === undefined ? 1 : Math.max(0, Math.min(1, a)));

    var rgb = {
        'r': Math.max(0, Math.min(255, r)),
        'g': Math.max(0, Math.min(255, g)),
        'b': Math.max(0, Math.min(255, b))
    };
    var hsv = null;
    var hsl = null;

    function getHue(maximum, range) {

        if (range == 0) {

            var hue = 0;

        } else {

            switch (maximum) {

                case rgb.r:
                    var hue = (rgb.g - rgb.b) / range * 60;
                    if (hue < 0)
                        hue += 360;
                    break;

                case rgb.g:
                    var hue = (rgb.b - rgb.r) / range * 60 + 120;
                    break;

                case rgb.b:
                    var hue = (rgb.r - rgb.g) / range * 60 + 240;
                    break;

            }

        }

        return hue;

    }

    function calculateHSV() {

        var maximum = Math.max(rgb.r, rgb.g, rgb.b);
        var range = maximum - Math.min(rgb.r, rgb.g, rgb.b);

        hsv = {
            'h': getHue(maximum, range),
            's': (maximum == 0 ? 0 : 100 * range / maximum),
            'v': maximum / 2.55
        };

    }

    function calculateHSL() {

        var maximum = Math.max(rgb.r, rgb.g, rgb.b);
        var range = maximum - Math.min(rgb.r, rgb.g, rgb.b);

        var l = maximum / 255 - range / 510;

        hsl = {
            'h': getHue(maximum, range),
            's': (range == 0 ? 0 : range / 2.55 / (l < 0.5 ? l * 2 : 2 - l * 2)),
            'l': 100 * l
        };

    }

    this.getRGB = function() {

        return {
            'r': rgb.r,
            'g': rgb.g,
            'b': rgb.b,
            'a': alpha
        };

    };

    this.getHSV = function() {

        if (hsv == null)
            calculateHSV();

        return {
            'h': hsv.h,
            's': hsv.s,
            'v': hsv.v,
            'a': alpha
        };

    };

    this.getHSL = function() {

        if (hsl == null)
            calculateHSL();

        return {
            'h': hsl.h,
            's': hsl.s,
            'l': hsl.l,
            'a': alpha
        };

    };

}

HSVColour.prototype = new Colour();

function HSVColour(h, s, v, a) {

    var alpha = (a === undefined ? 1 : Math.max(0, Math.min(1, a)));

    var hsv = {
        'h': (h % 360 + 360) % 360,
        's': Math.max(0, Math.min(100, s)),
        'v': Math.max(0, Math.min(100, v))
    };

    var rgb = null;
    var hsl = null;

    function calculateRGB() {

        if (hsv.s == 0) {

            var r = hsv.v;
            var g = hsv.v;
            var b = hsv.v;

        } else {

            var f = hsv.h / 60 - Math.floor(hsv.h / 60);
            var p = hsv.v * (1 - hsv.s / 100);
            var q = hsv.v * (1 - hsv.s / 100 * f);
            var t = hsv.v * (1 - hsv.s / 100 * (1 - f));

            switch (Math.floor(hsv.h / 60)) {
                case 0:
                    var r = hsv.v;
                    var g = t;
                    var b = p;
                    break;
                case 1:
                    var r = q;
                    var g = hsv.v;
                    var b = p;
                    break;
                case 2:
                    var r = p;
                    var g = hsv.v;
                    var b = t;
                    break;
                case 3:
                    var r = p;
                    var g = q;
                    var b = hsv.v;
                    break;
                case 4:
                    var r = t;
                    var g = p;
                    var b = hsv.v;
                    break;
                case 5:
                    var r = hsv.v;
                    var g = p;
                    var b = q;
                    break;
            }

        }

        rgb = {
            'r': r * 2.55,
            'g': g * 2.55,
            'b': b * 2.55
        };

    }

    function calculateHSL() {

        var l = (2 - hsv.s / 100) * hsv.v / 2;

        hsl = {
            'h': hsv.h,
            's': hsv.s * hsv.v / (l < 50 ? l * 2 : 200 - l * 2),
            'l': l
        };
        if (isNaN(hsl.s))
            hsl.s = 0;

    }

    this.getRGB = function() {

        if (rgb == null)
            calculateRGB();

        return {
            'r': rgb.r,
            'g': rgb.g,
            'b': rgb.b,
            'a': alpha
        };

    };

    this.getHSV = function() {

        return {
            'h': hsv.h,
            's': hsv.s,
            'v': hsv.v,
            'a': alpha
        };

    };

    this.getHSL = function() {

        if (hsl == null)
            calculateHSL();

        return {
            'h': hsl.h,
            's': hsl.s,
            'l': hsl.l,
            'a': alpha
        };

    };

}

HSLColour.prototype = new Colour();

function HSLColour(h, s, l, a) {

    var alpha = (a === undefined ? 1 : Math.max(0, Math.min(1, a)));

    var hsl = {
        'h': (h % 360 + 360) % 360,
        's': Math.max(0, Math.min(100, s)),
        'l': Math.max(0, Math.min(100, l))
    };

    var rgb = null;
    var hsv = null;

    function calculateRGB() {

        if (hsl.s == 0) {

            rgb = {
                'r': hsl.l * 2.55,
                'g': hsl.l * 2.55,
                'b': hsl.l * 2.55
            };

        } else {

            var p = hsl.l < 50 ?
                hsl.l * (1 + hsl.s / 100) :
                hsl.l + hsl.s - hsl.l * hsl.s / 100;
            var q = 2 * hsl.l - p;

            rgb = {
                'r': (h + 120) / 60 % 6,
                'g': h / 60,
                'b': (h + 240) / 60 % 6
            };

            for (var key in rgb) {

                if (rgb.hasOwnProperty(key)) {

                    if (rgb[key] < 1) {
                        rgb[key] = q + (p - q) * rgb[key];
                    } else if (rgb[key] < 3) {
                        rgb[key] = p;
                    } else if (rgb[key] < 4) {
                        rgb[key] = q + (p - q) * (4 - rgb[key]);
                    } else {
                        rgb[key] = q;
                    }

                    rgb[key] *= 2.55;

                }

            }

        }

    }

    function calculateHSV() {

        var t = hsl.s * (hsl.l < 50 ? hsl.l : 100 - hsl.l) / 100;

        hsv = {
            'h': hsl.h,
            's': 200 * t / (hsl.l + t),
            'v': t + hsl.l
        };

        if (isNaN(hsv.s))
            hsv.s = 0;

    }

    this.getRGB = function() {

        if (rgb == null)
            calculateRGB();

        return {
            'r': rgb.r,
            'g': rgb.g,
            'b': rgb.b,
            'a': alpha
        };

    };

    this.getHSV = function() {

        if (hsv == null)
            calculateHSV();

        return {
            'h': hsv.h,
            's': hsv.s,
            'v': hsv.v,
            'a': alpha
        };

    };
    this.getHSL = function() {

        return {
            'h': hsl.h,
            's': hsl.s,
            'l': hsl.l,
            'a': alpha
        };

    };

}