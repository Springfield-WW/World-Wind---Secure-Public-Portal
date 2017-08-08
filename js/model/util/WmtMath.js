define(['worldwind'],
    function(ww) {
        "use strict";
        var WmtMath = {
            angleBetween: function(a, b) {
                if (!a || !b) {
                    throw new WorldWind.ArgumentError(
                        WorldWind.Logger.logMessage(WorldWind.Logger.LEVEL_SEVERE,
                            "Terrain", "projectOnty", "missingVector"));
                }
                var dot = a.dot(b),
                    length = a.magnitude() * b.magnitude();
                if (!(length === 0) && (length !== 1.0)) {
                    dot /= length;
                }
                if (dot < -1.0) {
                    dot = -1.0;
                } else if (dot > 1.0) {
                    dot = 1.0;
                }
                return Math.acos(dot) * WorldWind.Angle.RADIANS_TO_DEGREES;
            },
            projectOnto: function(a, b, result) {
                if (!a || !b || !result) {
                    throw new WorldWind.ArgumentError(
                        WorldWind.Logger.logMessage(WorldWind.Logger.LEVEL_SEVERE, "Terrain", "projectOnty", "missingVector"));
                }
                var dot = a.dot(b),
                    length = b.magnitude();
                if (!(length === 0) && (length !== 1.0)) {
                    dot /= length;
                }
                result.copy(b).multiply(dot);
                return result;
            },
            perpendicularTo: function(a, b, result) {
                if (!a || !b || !result) {
                    throw new WorldWind.ArgumentError(
                        WorldWind.Logger.logMessage(WorldWind.Logger.LEVEL_SEVERE, "Terrain", "projectOnty", "missingVector"));
                }
                var projected = new WorldWind.Vec3();
                this.projectOnto(a, b, projected);
                result.copy(a).subtract(projected);
                return result;
            }
        };
        return WmtMath;
    }
);