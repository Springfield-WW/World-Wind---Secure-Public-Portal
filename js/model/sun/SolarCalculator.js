define([],
    function() {
        "use strict";
        var SolarCalculator = function() {

            var calcTimeJulianCent = function(jd) {
                var T = (jd - 2451545.0) / 36525.0;
                return T;
            };
            var calcJDFromJulianCent = function(t) {
                var JD = t * 36525.0 + 2451545.0;
                return JD;
            };
            var isLeapYear = function(yr) {
                return ((yr % 4 == 0 && yr % 100 != 0) || yr % 400 == 0);
            };
            var calcDoyFromJD = function(jd) {
                var z = Math.floor(jd + 0.5);
                var f = (jd + 0.5) - z;
                if (z < 2299161) {
                    var A = z;
                } else {
                    var alpha = Math.floor((z - 1867216.25) / 36524.25);
                    var A = z + 1 + alpha - Math.floor(alpha / 4);
                }
                var B = A + 1524;
                var C = Math.floor((B - 122.1) / 365.25);
                var D = Math.floor(365.25 * C);
                var E = Math.floor((B - D) / 30.6001);
                var day = B - D - Math.floor(30.6001 * E) + f;
                var month = (E < 14) ? E - 1 : E - 13;
                var year = (month > 2) ? C - 4716 : C - 4715;

                var k = (isLeapYear(year) ? 1 : 2);
                var doy = Math.floor((275 * month) / 9) - k * Math.floor((month + 9) / 12) + day - 30;
                return doy;
            };
            var radToDeg = function(angleRad) {
                return (180.0 * angleRad / Math.PI);
            };
            var degToRad = function(angleDeg) {
                return (Math.PI * angleDeg / 180.0);
            };
            var calcGeomMeanLongSun = function(t) {
                var L0 = 280.46646 + t * (36000.76983 + t * (0.0003032));
                while (L0 > 360.0) {
                    L0 -= 360.0;
                }
                while (L0 < 0.0) {
                    L0 += 360.0;
                }
                return L0;
            };
            var calcGeomMeanAnomalySun = function(t) {
                var M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
                return M;
            };
            var calcEccentricityEarthOrbit = function(t) {
                var e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
                return e;
            };
            var calcSunEqOfCenter = function(t) {
                var m = calcGeomMeanAnomalySun(t);
                var mrad = degToRad(m);
                var sinm = Math.sin(mrad);
                var sin2m = Math.sin(mrad + mrad);
                var sin3m = Math.sin(mrad + mrad + mrad);
                var C = sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) + sin2m * (0.019993 - 0.000101 * t) + sin3m * 0.000289;
                return C;
            };
            var calcSunTrueLong = function(t) {
                var l0 = calcGeomMeanLongSun(t);
                var c = calcSunEqOfCenter(t);
                var O = l0 + c;
                return O;
            };
            var calcSunTrueAnomaly = function(t) {
                var m = calcGeomMeanAnomalySun(t);
                var c = calcSunEqOfCenter(t);
                var v = m + c;
                return v;
            };
            var calcSunRadVector = function(t) {
                var v = calcSunTrueAnomaly(t);
                var e = calcEccentricityEarthOrbit(t);
                var R = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(degToRad(v)));
                return R;
            };
            var calcSunApparentLong = function(t) {
                var o = calcSunTrueLong(t);
                var omega = 125.04 - 1934.136 * t;
                var lambda = o - 0.00569 - 0.00478 * Math.sin(degToRad(omega));
                return lambda;
            };
            var calcMeanObliquityOfEcliptic = function(t) {
                var seconds = 21.448 - t * (46.8150 + t * (0.00059 - t * (0.001813)));
                var e0 = 23.0 + (26.0 + (seconds / 60.0)) / 60.0;
                return e0;
            };
            var calcObliquityCorrection = function(t) {
                var e0 = calcMeanObliquityOfEcliptic(t);
                var omega = 125.04 - 1934.136 * t;
                var e = e0 + 0.00256 * Math.cos(degToRad(omega));
                return e;
            };
            var calcSunRtAscension = function(t) {
                var e = calcObliquityCorrection(t);
                var lambda = calcSunApparentLong(t);
                var tananum = (Math.cos(degToRad(e)) * Math.sin(degToRad(lambda)));
                var tanadenom = (Math.cos(degToRad(lambda)));
                var alpha = radToDeg(Math.atan2(tananum, tanadenom));
                return alpha;
            };
            var calcSunDeclination = function(t) {
                var e = calcObliquityCorrection(t);
                var lambda = calcSunApparentLong(t);

                var sint = Math.sin(degToRad(e)) * Math.sin(degToRad(lambda));
                var theta = radToDeg(Math.asin(sint));
                return theta;
            };
            var calcEquationOfTime = function(t) {
                var epsilon = calcObliquityCorrection(t);
                var l0 = calcGeomMeanLongSun(t);
                var e = calcEccentricityEarthOrbit(t);
                var m = calcGeomMeanAnomalySun(t);

                var y = Math.tan(degToRad(epsilon) / 2.0);
                y *= y;

                var sin2l0 = Math.sin(2.0 * degToRad(l0));
                var sinm = Math.sin(degToRad(m));
                var cos2l0 = Math.cos(2.0 * degToRad(l0));
                var sin4l0 = Math.sin(4.0 * degToRad(l0));
                var sin2m = Math.sin(2.0 * degToRad(m));

                var Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0 - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;
                return radToDeg(Etime) * 4.0;
            };
            var calcHourAngleSunrise = function(lat, solarDec) {
                var latRad = degToRad(lat);
                var sdRad = degToRad(solarDec);
                var HAarg = (Math.cos(degToRad(90.833)) / (Math.cos(latRad) * Math.cos(sdRad)) - Math.tan(latRad) * Math.tan(sdRad));
                var HA = Math.acos(HAarg);
                return HA;
            };
            var isNumber = function(inputVal) {
                var oneDecimal = false;
                var inputStr = "" + inputVal;
                for (var i = 0; i < inputStr.length; i++) {
                    var oneChar = inputStr.charAt(i);
                    if (i == 0 && (oneChar == "-" || oneChar == "+")) {
                        continue;
                    }
                    if (oneChar == "." && !oneDecimal) {
                        oneDecimal = true;
                        continue;
                    }
                    if (oneChar < "0" || oneChar > "9") {
                        return false;
                    }
                }
                return true;
            }
            this.getJD = function(year, month, day) {
                if (month <= 2) {
                    year -= 1;
                    month += 12;
                }
                var A = Math.floor(year / 100);
                var B = 2 - A + Math.floor(A / 4);
                var JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
                return JD;
            };
            var getTimeLocal = function(hour, minute, second) {
                var mins = hour * 60 + minute + second / 60.0;
                return mins;
            };
            var calcAzEl = function(output, T, localtime, latitude, longitude, zone) {
                var eqTime = calcEquationOfTime(T);
                var theta = calcSunDeclination(T);
                var solarTimeFix = eqTime + 4.0 * longitude - 60.0 * zone;
                var earthRadVec = calcSunRadVector(T);
                var trueSolarTime = localtime + solarTimeFix;
                while (trueSolarTime > 1440) {
                    trueSolarTime -= 1440;
                }
                var hourAngle = trueSolarTime / 4.0 - 180.0;
                if (hourAngle < -180) {
                    hourAngle += 360.0;
                }
                var haRad = degToRad(hourAngle);
                var csz = Math.sin(degToRad(latitude)) * Math.sin(degToRad(theta)) + Math.cos(degToRad(latitude)) * Math.cos(degToRad(theta)) * Math.cos(haRad);
                if (csz > 1.0) {
                    csz = 1.0
                } else if (csz < -1.0) {
                    csz = -1.0
                }
                var zenith = radToDeg(Math.acos(csz));
                var azDenom = (Math.cos(degToRad(latitude)) * Math.sin(degToRad(zenith)));
                if (Math.abs(azDenom) > 0.001) {
                    var azRad = ((Math.sin(degToRad(latitude)) * Math.cos(degToRad(zenith))) - Math.sin(degToRad(theta))) / azDenom;
                    if (Math.abs(azRad) > 1.0) {
                        if (azRad < 0) {
                            azRad = -1.0;
                        } else {
                            azRad = 1.0;
                        }
                    }
                    var azimuth = 180.0 - radToDeg(Math.acos(azRad));
                    if (hourAngle > 0.0) {
                        azimuth = -azimuth;
                    }
                } else {
                    if (latitude > 0.0) {
                        azimuth = 180.0;
                    } else {
                        azimuth = 0.0;
                    }
                }
                if (azimuth < 0.0) {
                    azimuth += 360.0;
                }
                var exoatmElevation = 90.0 - zenith;


                var refractionCorrection = 0.0;
                if (exoatmElevation > 85.0) {
                    refractionCorrection = 0.0;
                } else {
                    var te = Math.tan(degToRad(exoatmElevation));
                    if (exoatmElevation > 5.0) {
                        refractionCorrection = 58.1 / te - 0.07 / (te * te * te) + 0.000086 / (te * te * te * te * te);
                    } else if (exoatmElevation > -0.575) {
                        refractionCorrection = 1735.0 + exoatmElevation * (-518.2 + exoatmElevation * (103.4 + exoatmElevation * (-12.79 + exoatmElevation * 0.711)));
                    } else {
                        refractionCorrection = -20.774 / te;
                    }
                    refractionCorrection = refractionCorrection / 3600.0;
                }

                var solarZen = zenith - refractionCorrection;
                var result = {
                    eot: eqTime,
                    theta: theta,
                    azimuth: azimuth,
                    zenith: solarZen
                };
                return result;
            };
            var calcSolNoon = function(jd, longitude, timezone, dst) {
                var tnoon = calcTimeJulianCent(jd - longitude / 360.0);
                var eqTime = calcEquationOfTime(tnoon);
                var solNoonOffset = 720.0 - (longitude * 4) - eqTime;
                var newt = calcTimeJulianCent(jd + solNoonOffset / 1440.0);
                eqTime = calcEquationOfTime(newt);
                var solNoonLocal = 720 - (longitude * 4) - eqTime + (timezone * 60.0);
                if (dst)
                    solNoonLocal += 60.0;
                while (solNoonLocal < 0.0) {
                    solNoonLocal += 1440.0;
                }
                while (solNoonLocal >= 1440.0) {
                    solNoonLocal -= 1440.0;
                }
                return solNoonLocal;
            };
            var calcSunriseSetUTC = function(rise, JD, latitude, longitude) {
                var t = calcTimeJulianCent(JD);
                var eqTime = calcEquationOfTime(t);
                var solarDec = calcSunDeclination(t);
                var hourAngle = calcHourAngleSunrise(latitude, solarDec);
                if (!rise)
                    hourAngle = -hourAngle;
                var delta = longitude + radToDeg(hourAngle);
                var timeUTC = 720 - (4.0 * delta) - eqTime;
                var result = {
                    timeUTC: timeUTC,
                    hourAngle: radToDeg(hourAngle)
                };
                return result
            };
            var calcSunriseSet = function(rise, JD, latitude, longitude, timezone, dst) {
                var result = calcSunriseSetUTC(rise, JD, latitude, longitude);
                var timeUTC = result.timeUTC;
                var newResult = calcSunriseSetUTC(rise, JD + result.timeUTC / 1440.0, latitude, longitude);
                if (isNumber(newResult.timeUTC)) {
                    var timeLocal = newResult.timeUTC + (timezone * 60.0);
                    timeLocal += ((dst) ? 60.0 : 0.0);
                    if ((timeLocal >= 0.0) && (timeLocal < 1440.0)) {} else {
                        var jday = JD;
                        var increment = ((timeLocal < 0) ? 1 : -1);
                        while ((timeLocal < 0.0) || (timeLocal >= 1440.0)) {
                            timeLocal += increment * 1440.0;
                            jday -= increment
                        }
                    }
                } else {
                    var doy = calcDoyFromJD(JD);
                    var jdy;
                    if (((latitude > 66.4) && (doy > 79) && (doy < 267)) ||
                        ((latitude < -66.4) && ((doy < 83) || (doy > 263)))) {
                        if (rise) {
                            jdy = calcJDofNextPrevRiseSet(0, rise, JD, latitude, longitude, timezone, dst)
                        } else {
                            jdy = calcJDofNextPrevRiseSet(1, rise, JD, latitude, longitude, timezone, dst)
                        }
                    } else {
                        if (rise == 1) {
                            jdy = calcJDofNextPrevRiseSet(1, rise, JD, latitude, longitude, timezone, dst)
                        } else {
                            jdy = calcJDofNextPrevRiseSet(0, rise, JD, latitude, longitude, timezone, dst)
                        }
                    }
                }
                result.timeLocal = timeLocal;
                return result;
            };
            var calcJDofNextPrevRiseSet = function(next, rise, JD, latitude, longitude, tz, dst) {
                var julianday = JD;
                var increment = ((next) ? 1.0 : -1.0);

                var result = calcSunriseSetUTC(rise, julianday, latitude, longitude);
                var time = result.timeUTC;
                while (!isNumber(time)) {
                    julianday += increment;
                    result = calcSunriseSetUTC(rise, julianday, latitude, longitude);
                    time = result.timeUTC;
                }
                var timeLocal = time + tz * 60.0 + ((dst) ? 60.0 : 0.0);
                while ((timeLocal < 0.0) || (timeLocal >= 1440.0)) {
                    var incr = ((timeLocal < 0) ? 1 : -1);
                    timeLocal += (incr * 1440.0);
                    julianday -= incr
                }
                return julianday;
            };
            this.calculate = function(localTime, utcOffset, lat, lng) {

                var year = localTime ? localTime.getFullYear() : undefined;
                var month = localTime ? localTime.getMonth() + 1 : undefined;
                var day = localTime ? localTime.getDate() : undefined;
                var hour = localTime ? localTime.getHours() : undefined;
                var minute = localTime ? localTime.getMinutes() : undefined;
                var second = localTime ? localTime.getSeconds() : undefined;
                var tz = utcOffset || 0;

                var jday = this.getJD(year, month, day);
                var tl = getTimeLocal(hour, minute, second);
                var julianDay = jday + tl / 1440.0 - tz / 24.0;
                var T = calcTimeJulianCent(julianDay);

                var eqTime = calcEquationOfTime(T);
                var theta = calcSunDeclination(T);

                var solarTimeFix = eqTime + 4.0 * lng - 60.0 * tz;
                var earthRadVec = calcSunRadVector(T);
                var trueSolarTime = tl + solarTimeFix;
                while (trueSolarTime > 1440) {
                    trueSolarTime -= 1440;
                }
                var hourAngle = trueSolarTime / 4.0 - 180.0;
                if (hourAngle < -180) {
                    hourAngle += 360.0;
                }
                var haRad = degToRad(hourAngle);
                var csz = Math.sin(degToRad(lat)) * Math.sin(degToRad(theta)) + Math.cos(degToRad(lat)) * Math.cos(degToRad(theta)) * Math.cos(haRad);
                if (csz > 1.0) {
                    csz = 1.0
                } else if (csz < -1.0) {
                    csz = -1.0
                }
                var zenith = radToDeg(Math.acos(csz));
                var azDenom = (Math.cos(degToRad(lat)) * Math.sin(degToRad(zenith)));
                if (Math.abs(azDenom) > 0.001) {
                    var azRad = ((Math.sin(degToRad(lat)) * Math.cos(degToRad(zenith))) - Math.sin(degToRad(theta))) / azDenom;
                    if (Math.abs(azRad) > 1.0) {
                        if (azRad < 0) {
                            azRad = -1.0;
                        } else {
                            azRad = 1.0;
                        }
                    }
                    var azimuth = 180.0 - radToDeg(Math.acos(azRad));
                    if (hourAngle > 0.0) {
                        azimuth = -azimuth;
                    }
                } else {
                    if (lat > 0.0) {
                        azimuth = 180.0;
                    } else {
                        azimuth = 0.0;
                    }
                }
                if (azimuth < 0.0) {
                    azimuth += 360.0;
                }
                var exoatmElevation = 90.0 - zenith;


                var refractionCorrection = 0.0;
                if (exoatmElevation > 85.0) {
                    refractionCorrection = 0.0;
                } else {
                    var te = Math.tan(degToRad(exoatmElevation));
                    if (exoatmElevation > 5.0) {
                        refractionCorrection = 58.1 / te - 0.07 / (te * te * te) + 0.000086 / (te * te * te * te * te);
                    } else if (exoatmElevation > -0.575) {
                        refractionCorrection = 1735.0 + exoatmElevation * (-518.2 + exoatmElevation * (103.4 + exoatmElevation * (-12.79 + exoatmElevation * 0.711)));
                    } else {
                        refractionCorrection = -20.774 / te;
                    }
                    refractionCorrection = refractionCorrection / 3600.0;
                }
                var solarZen = zenith - refractionCorrection;


                calcSolNoon(jday, lng, tz);
                var rise = calcSunriseSet(1, jday, lat, lng, tz);
                var set = calcSunriseSet(0, jday, lat, lng, tz);
                var midnight = new Date(localTime.getFullYear(), localTime.getMonth(), localTime.getDate());
                var sunriseTime = new Date(midnight.getTime() + rise.timeLocal * 60000);
                var sunsetTime = new Date(midnight.getTime() + set.timeLocal * 60000);

                var alpha = calcSunRtAscension(T);

                while (alpha < 0)
                    alpha += 360;

                var elapsedJulianDays = julianDay - 2451545.0;
                var greenwichMeanSiderealTime = (18.697374558 + 24.06570982441908 * elapsedJulianDays) % 24;
                var longitude = alpha - (greenwichMeanSiderealTime * 15.0);

                while (longitude > 180)
                    longitude -= 360;
                while (longitude < -180)
                    longitude += 360;
                while (azimuth > 180)
                    azimuth -= 360;
                while (longitude < -180)
                    azimuth += 360;


                var sunlight = {
                    year: year,
                    month: month,
                    day: day,
                    hour: hour,
                    minute: minute,
                    second: second,
                    utcOffset: tz,
                    julianDate: julianDay,
                    observerLatitude: lat,
                    observerLongitude: lng,
                    subsolarLatitude: theta,
                    subsolarLongitude: longitude,
                    azimuth: azimuth,
                    zenith: zenith,
                    rightAscension: alpha,
                    hourAngle: hourAngle,
                    sunriseHourAngle: rise.hourAngle,
                    sunsetHourAngle: set.hourAngle,
                    sunrise: sunriseTime,
                    sunset: sunsetTime
                };
                return sunlight;
            };
        };
        return SolarCalculator;
    }
);