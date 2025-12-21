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
  return phase === 0
    ? 'New Moon'
    : phase > 0 && phase < 0.25
      ? 'Waxing Crescent'
      : phase === 0.25
        ? 'First Quarter'
        : phase > 0.25 && phase < 0.5
          ? 'Waxing Gibbous'
          : phase === 0.5
            ? 'Full Moon'
            : phase > 0.5 && phase < 0.75
              ? 'Waning Gibbous'
              : phase === 0.75
                ? 'Last Quarter'
                : phase > 0.75 && phase <= 1
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
