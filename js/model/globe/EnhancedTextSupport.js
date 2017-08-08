define(['worldwind'],
    function(ww) {
        "use strict";

        var EnhancedTextSupport = function() {

            this.canvas2D = document.createElement("canvas");

            this.ctx2D = this.canvas2D.getContext("2d");

            this.lineSpacing = 0.15;
        };

        EnhancedTextSupport.prototype.textSize = function(text, font) {
            if (text.length === 0) {
                return new WorldWind.Vec2(0, 0);
            }

            this.ctx2D.font = font.fontString;

            var lines = text.split("\n"),
                height = lines.length * (font.size * (1 + this.lineSpacing)),
                i, lines, maxWidth = 0;

            for (i = 0; i < lines.length; i++) {
                maxWidth = Math.max(maxWidth, this.ctx2D.measureText(lines[i]).width);
            }

            return new WorldWind.Vec2(maxWidth, height);
        };

        EnhancedTextSupport.prototype.createTexture = function(dc, text, font) {
            var gl = dc.currentGlContext,
                ctx2D = this.ctx2D,
                canvas2D = this.canvas2D,
                textSize = this.textSize(text, font),
                lines = text.split("\n"),
                x, y,
                blurSize = 5;

            canvas2D.width = Math.ceil(textSize[0]) + blurSize * 2;
            canvas2D.height = Math.ceil(textSize[1]);

            ctx2D.font = font.fontString;
            ctx2D.textBaseline = "top";
            ctx2D.textAlign = font.horizontalAlignment;
            ctx2D.fillStyle = WorldWind.Color.WHITE.toHexString(false);

            ctx2D.shadowBlur = blurSize;
            ctx2D.shadowColor = "black";
            ctx2D.shadowOffsetX = 0;

            if (font.horizontalAlignment === "left") {
                x = 0 + blurSize;
            } else if (font.horizontalAlignment === "right") {
                x = canvas2D.width - blurSize;
            } else {
                x = canvas2D.width / 2;
            }

            for (var i = 0; i < lines.length; i++) {
                y = i * font.size * (1 + this.lineSpacing);

                // BDS: Modification. Added calls to strokeText(...)
                ctx2D.strokeText(lines[i], x, y);

                ctx2D.fillText(lines[i], x, y);
            }

            return new WorldWind.Texture(gl, canvas2D);
        };

        return EnhancedTextSupport;
    });