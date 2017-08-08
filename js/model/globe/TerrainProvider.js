define([
        'model/Config',
        'model/util/Log',
        'model/globe/Terrain',
        'model/util/WmtMath',
        'model/util/WmtUtil',
        'worldwind'
    ],
    function(
        config,
        log,
        Terrain,
        wmtMath,
        wmtUtil,
        ww) {
        "use strict";
        var TerrainProvider = function(globe) {
            this.wwGlobe = globe.wwd.globe;
        };
        TerrainProvider.prototype.elevationAtLatLon = function(latitude, longitude) {
            return this.wwGlobe.elevationAtLocation(latitude, longitude);
        };
        TerrainProvider.prototype.elevationAtLatLonHiRes = function(latitude, longitude, targetResolution) {
            var resolution = targetResolution || 1 / WorldWind.EARTH_RADIUS,
                sector = new WorldWind.Sector(
                    latitude - 0.00005,
                    latitude + 0.00005,
                    longitude - 0.00005,
                    longitude + 0.00005),
                numLat = 1,
                numLon = 1,
                result = new Array(numLat * numLon),
                resultResolution;

            resultResolution = this.wwGlobe.elevationsForGrid(sector, numLat, numLon, targetResolution, result);
            return isNaN(result[0]) ? 0 : result[0];
        };
        TerrainProvider.prototype.terrainAtLatLon = function(latitude, longitude, targetResolution) {
            var terrainNormal = new WorldWind.Vec3(),
                surfaceNormal = new WorldWind.Vec3(),
                northNormal = new WorldWind.Vec3(),
                perpendicular = new WorldWind.Vec3(),
                tempcross = new WorldWind.Vec3(),
                slope,
                aspect,
                direction,
                elevation,
                terrain;

            if (!latitude || !longitude) {
                log.error("Terrain", "terrainLatLon", "missingCoordinate(s)");
                terrain = new Terrain();
                terrain.copy(Terrain.INVALID);
                return terrain;
            }

            if (!targetResolution || isNaN(targetResolution)) {
                elevation = this.elevationAtLatLon(latitude, longitude);
                terrainNormal = this.terrainNormalAtLatLon(latitude, longitude);
            } else {
                elevation = this.elevationAtLatLonHiRes(latitude, longitude, targetResolution);
                terrainNormal = this.terrainNormalAtLatLonHiRes(latitude, longitude, targetResolution);
            }
            this.wwGlobe.surfaceNormalAtLocation(latitude, longitude, surfaceNormal);
            this.wwGlobe.northTangentAtLocation(latitude, longitude, northNormal);

            slope = wmtMath.angleBetween(terrainNormal, surfaceNormal);

            wmtMath.perpendicularTo(terrainNormal, surfaceNormal, perpendicular);
            aspect = wmtMath.angleBetween(perpendicular, northNormal);

            tempcross.copy(surfaceNormal).cross(northNormal);
            direction = (tempcross.dot(perpendicular) < 0) ? 1 : -1;
            aspect = aspect * direction;

            return new Terrain(latitude, longitude, elevation, aspect, slope);
        };
        TerrainProvider.prototype.terrainNormalAtLatLon = function(latitude, longitude, sampleRadius) {
            if (!latitude || !longitude) {
                throw new WorldWind.ArgumentError(
                    log.error("Terrain", "terrainNormalAtLatLon", "missingCoordinate(s)"));
            }
            var radianDistance = (sampleRadius || config.terrainSampleRadius) * wmtUtil.METERS_TO_RADIANS,
                n0 = new WorldWind.Location(latitude, longitude),
                n1 = new WorldWind.Location(),
                n2 = new WorldWind.Location(),
                n3 = new WorldWind.Location(),
                p1 = new WorldWind.Vec3(),
                p2 = new WorldWind.Vec3(),
                p3 = new WorldWind.Vec3(),
                SOUTH = 180,
                NW = -60,
                NE = 60,
                terrainNormal;


            WorldWind.Location.rhumbLocation(n0, SOUTH, radianDistance, n1);
            WorldWind.Location.rhumbLocation(n0, NW, radianDistance, n2);
            WorldWind.Location.rhumbLocation(n0, NE, radianDistance, n3);
            this.wwGlobe.computePointFromPosition(n1.latitude, n1.longitude, this.elevationAtLatLon(n1.latitude, n1.longitude), p1);
            this.wwGlobe.computePointFromPosition(n2.latitude, n2.longitude, this.elevationAtLatLon(n2.latitude, n2.longitude), p2);
            this.wwGlobe.computePointFromPosition(n3.latitude, n3.longitude, this.elevationAtLatLon(n3.latitude, n3.longitude), p3);
            terrainNormal = WorldWind.Vec3.computeTriangleNormal(p1, p2, p3);
            terrainNormal.negate();

            return terrainNormal;
        };
        TerrainProvider.prototype.terrainNormalAtLatLonHiRes = function(latitude, longitude, targetResolution) {
            if (!latitude || !longitude) {
                throw new WorldWind.ArgumentError(
                    log.error("Terrain", "terrainNormalAtLatLon", "missingCoordinate(s)"));
            }
            var n0 = new WorldWind.Location(latitude, longitude),
                n1 = new WorldWind.Location(),
                n2 = new WorldWind.Location(),
                n3 = new WorldWind.Location(),
                p1 = new WorldWind.Vec3(),
                p2 = new WorldWind.Vec3(),
                p3 = new WorldWind.Vec3(),
                SOUTH = 180,
                NW = -60,
                NE = 60,
                terrainNormal;


            WorldWind.Location.rhumbLocation(n0, SOUTH, -0.00005 * WorldWind.Angle.DEGREES_TO_RADIANS, n1);
            WorldWind.Location.rhumbLocation(n1, NW, -0.0001 * WorldWind.Angle.DEGREES_TO_RADIANS, n2);
            WorldWind.Location.rhumbLocation(n1, NE, -0.0001 * WorldWind.Angle.DEGREES_TO_RADIANS, n3);
            this.wwGlobe.computePointFromPosition(n1.latitude, n1.longitude, this.elevationAtLatLonHiRes(n1.latitude, n1.longitude, targetResolution), p1);
            this.wwGlobe.computePointFromPosition(n2.latitude, n2.longitude, this.elevationAtLatLonHiRes(n2.latitude, n2.longitude, targetResolution), p2);
            this.wwGlobe.computePointFromPosition(n3.latitude, n3.longitude, this.elevationAtLatLonHiRes(n3.latitude, n3.longitude, targetResolution), p3);
            terrainNormal = WorldWind.Vec3.computeTriangleNormal(p1, p2, p3);
            terrainNormal.negate();

            return terrainNormal;
        };
        return TerrainProvider;
    }
);