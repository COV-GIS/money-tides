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

const radiansToDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

export const altitudeToDegrees = (altitude: number, precision?: number): string => {
  return `${radiansToDegrees(altitude).toFixed(precision || 0)}°`;
};

export const azimuthToBearing = (azimuth: number, precision?: number): string => {
  azimuth = radiansToDegrees(azimuth);

  return azimuth === 0
    ? 'S'
    : azimuth === 90
    ? 'W'
    : azimuth === -90
    ? 'E'
    : azimuth === 180 || azimuth === -180
    ? 'N'
    : azimuth > 0 && azimuth < 90
    ? `S ${azimuth.toFixed(precision || 0)}° W`
    : azimuth > 90
    ? `N ${(azimuth - 90).toFixed(precision || 0)}° W`
    : azimuth < 0 && azimuth > -90
    ? `S ${Math.abs(azimuth).toFixed(precision || 0)}° E`
    : azimuth < -90
    ? `N ${(Math.abs(azimuth) - 90).toFixed(precision || 0)}° E`
    : 'bad azimuth';
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

export const moonPosition = (date: Date | DateTime, latitude: number, longitude: number): GetMoonPositionResult => {
  date = date instanceof Date ? date : date.toJSDate();

  return getMoonPosition(date, latitude, longitude);
};

export const sunPosition = (date: Date | DateTime, latitude: number, longitude: number): GetSunPositionResult => {
  date = date instanceof Date ? date : date.toJSDate();

  return getPosition(date, latitude, longitude);
};

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

// export const sunAndMoonPosition = (
//   date: Date | DateTime,
//   latitude: number,
//   longitude: number,
// ): { sunPosition: GetSunPositionResult; moonPosition: GetMoonPositionResult } => {
//   return {
//     sunPosition: sunPosition(date, latitude, longitude),
//     moonPosition: moonPosition(date, latitude, longitude),
//   };
// };
