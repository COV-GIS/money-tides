import type { __MT as MT } from '../interfaces';

import type {
  GetTimesResult,
  GetSunPositionResult,
  GetMoonPositionResult,
  GetMoonTimes,
  GetMoonIlluminationResult,
} from 'suncalc';
import type { ApiMagneticDeclinationResponse } from '../typings';

import { DateTime } from 'luxon';
import createURL from './createURL';
import { getTimes, getPosition, getMoonPosition, getMoonTimes, getMoonIllumination } from 'suncalc';

const MOON_DISTANCE = {
  average: 384400,
  longest: 406700,
  shortest: 356500,
};

export const radiansToDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

export const altitudeToDegrees = (altitude: number, precision?: number): string => {
  return `${radiansToDegrees(altitude).toFixed(precision || 0)}°`;
};

export const azimuthToBearing = (azimuth: number, precision?: number): string => {
  const _azimuth = Number(radiansToDegrees(azimuth).toFixed(precision || 0));

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

  const magneticDeclinationResponse: ApiMagneticDeclinationResponse = await (await fetch(url)).json();

  let declination = magneticDeclinationResponse.result[0].declination;

  if (format) {
    if (declination === 0) return '0°';

    const direction = declination > 0 ? 'E' : 'W';

    declination = Math.abs(declination);

    return `${Math.floor(declination)}° ${Math.floor((declination - Math.floor(declination)) * 60)}' ${direction}`;
  }

  return declination;
};

export const moonPhase = (phase: number): string => {
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

export const moonPosition = (date: Date | DateTime, latitude: number, longitude: number): GetMoonPositionResult => {
  const _date = date instanceof Date ? date : date.toJSDate();

  return getMoonPosition(_date, latitude, longitude);
};

export const sunPosition = (date: Date | DateTime, latitude: number, longitude: number): GetSunPositionResult => {
  const _date = date instanceof Date ? date : date.toJSDate();

  return getPosition(_date, latitude, longitude);
};

/**
 * at noon local time
 */
export const todaysSunAndMoon = (
  date: Date | DateTime,
  latitude: number,
  longitude: number,
): {
  sunTimes: GetTimesResult;
  moonTimes: GetMoonTimes;
  moonIllumination: GetMoonIlluminationResult;
} => {
  date = date instanceof Date ? date : date.toJSDate();

  return {
    sunTimes: getTimes(date, latitude, longitude),
    moonTimes: getMoonTimes(date, latitude, longitude),
    moonIllumination: getMoonIllumination(date),
  };
};

///////////////////////////////////////////////
// working
///////////////////////////////////////////////

export const sunAndMoon = (date: Date | DateTime, latitude: number, longitude: number): MT.SunAndMoon => {
  const _date = date instanceof Date ? date : date.toJSDate();

  const { rise: moonrise, set: moonset } = getMoonTimes(_date, latitude, longitude);

  const { distance } = getMoonPosition(_date, latitude, longitude);

  const { fraction: illumination, phase } = getMoonIllumination(_date);

  const { solarNoon, sunrise, sunset } = getTimes(_date, latitude, longitude);

  return {
    moon: {
      distance,
      illumination,
      illuminationPercent: `${(illumination * 100).toFixed(0)}%`,
      moonrise: moonrise ? DateTime.fromJSDate(moonrise) : undefined,
      moonset: moonset ? DateTime.fromJSDate(moonset) : undefined,
      phase,
      phaseName: moonPhase(phase),
    },
    sun: {
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
  moonPosition: MT.MoonPosition;
  sunPosition: MT.SunPosition;
} => {
  const {
    moon: { moonrise, moonset },
    sun: { sunrise, sunset },
  } = sunAndMoon(date, latitude, longitude);

  const moon = moonPosition(date, latitude, longitude);

  const sun = sunPosition(date, latitude, longitude);

  const time = date.toMillis();

  const moonRiseOrSet = (moonrise && time === moonrise.toMillis()) || (moonset && time === moonset.toMillis());

  const sunRiseOrSet = time === sunrise.toMillis() || time === sunset.toMillis();

  return {
    moonPosition: {
      aboveHorizon: moonRiseOrSet ? true : moon.altitude > 0,
      altitude: moonRiseOrSet ? '0°' : altitudeToDegrees(moon.altitude),
      bearing: azimuthToBearing(moon.azimuth),
      position: moon,
    },
    sunPosition: {
      aboveHorizon: sunRiseOrSet ? true : sun.altitude > 0,
      altitude: sunRiseOrSet ? '0°' : altitudeToDegrees(sun.altitude),
      bearing: azimuthToBearing(sun.azimuth),
      position: sun,
    },
  };
};
