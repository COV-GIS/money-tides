import type { MT } from '../interfaces';

import {
  getTimes as suncalcSunTimes,
  getPosition as suncalcSunPosition,
  getMoonPosition as suncalcMoonPosition,
  getMoonTimes as suncalcMoonTimes,
  getMoonIllumination as suncalcMoonIllumination,
} from 'suncalc';
import DateTime from './dateAndTimeUtils';
import createURL from './createURL';

export const MOON_DISTANCE = {
  average: 384400,
  longest: 406700,
  shortest: 356500,
};

export const azimuthToBearing = (azimuth: number): string => {
  const _azimuth = Number(radiansToDegrees(azimuth).toFixed(0));

  return _azimuth === 0
    ? 'South'
    : _azimuth === 90
      ? 'West'
      : _azimuth === -90
        ? 'East'
        : _azimuth === 180 || _azimuth === -180
          ? 'North'
          : _azimuth > 0 && _azimuth < 90
            ? `S ${_azimuth}° W`
            : _azimuth > 90
              ? `N ${_azimuth - 90}° W`
              : _azimuth < 0 && _azimuth > -90
                ? `S ${Math.abs(_azimuth)}° E`
                : _azimuth < -90
                  ? `N ${Math.abs(_azimuth) - 90}° E`
                  : 'invalid azimuth';
};

export const magneticDeclination = async (
  date: Date | DateTime,
  latitude: number,
  longitude: number,
  format?: boolean,
): Promise<number | string> => {
  date = date instanceof Date ? DateTime.fromJSDate(date) : date;

  const url = createURL('https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination', {
    key: 'zNEw7',
    lat1: latitude,
    lon1: longitude,
    model: 'WMM',
    startYear: date.get('year'),
    startMonth: date.get('month'),
    startDay: date.get('day'),
    resultFormat: 'json',
  });

  const magneticDeclinationResponse: MT.ApiMagneticDeclinationResponse = await (await fetch(url)).json();

  let declination = magneticDeclinationResponse.result[0].declination;

  if (format) {
    if (declination === 0) return '0°';

    const direction = declination > 0 ? 'E' : 'W';

    declination = Math.abs(declination);

    return `${Math.floor(declination)}° ${Math.floor((declination - Math.floor(declination)) * 60)}' ${direction}`;
  }

  return declination;
};

export const moonPhaseName = (phase: number): string => {
  return phase <= 0.05
    ? 'New Moon'
    : phase > 0.05 && phase < 0.2
      ? 'Waxing Crescent'
      : phase >= 0.2 && phase <= 0.3
        ? 'First Quarter'
        : phase > 0.3 && phase < 0.45
          ? 'Waxing Gibbous'
          : phase >= 0.45 && phase <= 0.55
            ? 'Full Moon'
            : phase > 0.55 && phase < 0.7
              ? 'Waning Gibbous'
              : phase >= 0.7 && phase <= 0.8
                ? 'Last Quarter'
                : phase > 0.8
                  ? 'Waning Crescent'
                  : 'Invalid Phase';
};

export const radiansToDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

export const sunAndMoon = (date: DateTime, latitude: number, longitude: number): MT.SunAndMoon => {
  const _date = date.toJSDate();

  const { rise: moonrise, set: moonset } = suncalcMoonTimes(_date, latitude, longitude);

  const { distance } = suncalcMoonPosition(_date, latitude, longitude);

  const { fraction: illumination, phase } = suncalcMoonIllumination(_date);

  const { nadir, solarNoon, sunrise, sunset } = suncalcSunTimes(_date, latitude, longitude);

  return {
    moon: {
      distance,
      illumination,
      illuminationPercent: `${(illumination * 100).toFixed(0)}%`,
      moonrise: moonrise ? DateTime.fromJSDate(moonrise) : undefined,
      moonset: moonset ? DateTime.fromJSDate(moonset) : undefined,
      phase,
      phaseName: moonPhaseName(phase),
    },
    sun: {
      nadir: DateTime.fromJSDate(nadir),
      solarNoon: DateTime.fromJSDate(solarNoon),
      sunrise: DateTime.fromJSDate(sunrise),
      sunset: DateTime.fromJSDate(sunset),
    },
  };
};

export const sunAndMoonPosition = (
  date: DateTime,
  latitude: number,
  longitude: number,
): {
  moonPosition: MT.SunMoonPosition;
  sunPosition: MT.SunMoonPosition;
} => {
  const _date = date.toJSDate();

  const {
    moon: { moonrise, moonset },
    sun: { sunrise, sunset },
  } = sunAndMoon(date, latitude, longitude);

  const { altitude: moonAltitude, azimuth: moonAzimuth } = suncalcMoonPosition(_date, latitude, longitude);

  const { altitude: sunAltitude, azimuth: sunAzimuth } = suncalcSunPosition(_date, latitude, longitude);

  const time = date.toMillis();

  const moonRiseOrSet = (moonrise && time === moonrise.toMillis()) || (moonset && time === moonset.toMillis());

  const sunRiseOrSet = time === sunrise.toMillis() || time === sunset.toMillis();

  const moonAltitudeDegrees = radiansToDegrees(moonAltitude);

  const sunAltitudeDegrees = radiansToDegrees(sunAltitude);

  return {
    moonPosition: {
      aboveHorizon: moonRiseOrSet ? true : moonAltitude > 0,
      altitude: moonAltitudeDegrees,
      altitudeDegrees: moonRiseOrSet ? '0°' : `${moonAltitudeDegrees.toFixed(0)}°`,
      azimuth: moonAzimuth,
      azimuthBearing: azimuthToBearing(moonAzimuth),
      type: 'moon',
    },
    sunPosition: {
      aboveHorizon: sunRiseOrSet ? true : sunAltitude > 0,
      altitude: sunAltitudeDegrees,
      altitudeDegrees: sunRiseOrSet ? '0°' : `${sunAltitudeDegrees.toFixed(0)}°`,
      azimuth: sunAzimuth,
      azimuthBearing: azimuthToBearing(sunAzimuth),
      type: 'sun',
    },
  };
};

const celestialCoordinates = (azimuth: number, altitude: number, distance: number): { x: number; y: number } => {
  const r = distance * Math.cos(altitude);

  return {
    x: r * Math.sin(azimuth),
    y: r * Math.cos(azimuth),
  };
};

const earthSunDistance = (date: Date): number => {
  // Constants
  const AU = 149597870.7; // Astronomical Unit in km
  const e = 0.0167086; // Orbital eccentricity of Earth
  const deg2rad = Math.PI / 180;

  // Days since J2000.0
  const JD = date.getTime() / 86400000 + 2440587.5; // Julian Date
  const n = JD - 2451545.0;

  // Mean anomaly (degrees)
  const M = (357.5291 + 0.98560028 * n) % 360;

  // Convert to radians
  const M_rad = M * deg2rad;

  // Sun's distance in AU using Kepler's equation approximation
  const distanceAU = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(M_rad + 102.9372 * deg2rad));

  // Convert AU to kilometers
  return distanceAU * AU;
};

const coordinateAngle = (x1: number, y1: number, x2: number, y2: number): { degrees: number; radians: number } => {
  const radians = Math.atan2(y2 - y1, x2 - x1);

  return {
    degrees: radiansToDegrees(radians),
    radians,
  };
};

export const rotateCoordinate = (
  x: number,
  y: number,
  radians: number,
  originX?: number,
  originY?: number,
): { x: number; y: number } => {
  // translate point to origin
  const dx = x - (originX || 0);

  const dy = y - (originY || 0);

  // rotate
  const rotatedX = dx * Math.cos(radians) - dy * Math.sin(radians);

  const rotatedY = dx * Math.sin(radians) + dy * Math.cos(radians);

  // translate back
  return {
    x: rotatedX + (originX || 0),
    y: rotatedY + (originY || 0),
  };
};

export const earthMoonSunCoordinates = (
  date: DateTime,
  latitude: number,
  longitude: number,
): {
  earth: { x: number; y: number };
  moon: { angle: { degrees: number; radians: number }; x: number; y: number };
  sun: { angle: { degrees: number; radians: number }; x: number; y: number };
} => {
  const _date = date.toJSDate();

  const {
    altitude: moonAltitude,
    azimuth: moonAzimuth,
    distance: moonDistance,
  } = suncalcMoonPosition(_date, latitude, longitude);

  const { altitude: sunAltitude, azimuth: sunAzimuth } = suncalcSunPosition(_date, latitude, longitude);

  const moonCoordinates = celestialCoordinates(moonAzimuth, moonAltitude, moonDistance);

  const sunCoordinates = celestialCoordinates(sunAzimuth, sunAltitude, earthSunDistance(_date));

  const moonAngle = coordinateAngle(0, 0, moonCoordinates.x, moonCoordinates.y);

  const sunAngle = coordinateAngle(0, 0, sunCoordinates.x, sunCoordinates.y);

  return {
    earth: { x: 0, y: 0 },
    moon: { angle: moonAngle, ...moonCoordinates },
    sun: { angle: sunAngle, ...sunCoordinates },
  };
};
