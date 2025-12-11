import type {
  GetTimesResult,
  GetSunPositionResult,
  GetMoonPositionResult,
  GetMoonTimes,
  GetMoonIlluminationResult,
} from 'suncalc';

import { DateTime } from 'luxon';
import { getTimes, getPosition, getMoonPosition, getMoonTimes, getMoonIllumination } from 'suncalc';

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

export const sunPosition = (date: Date | DateTime, latitude: number, longitude: number): GetSunPositionResult => {
  date = date instanceof Date ? date : date.toJSDate();

  return getPosition(date, latitude, longitude);
};

export const moonPosition = (date: Date | DateTime, latitude: number, longitude: number): GetMoonPositionResult => {
  date = date instanceof Date ? date : date.toJSDate();

  return getMoonPosition(date, latitude, longitude);
};

export const sunAndMoonPosition = (
  date: Date | DateTime,
  latitude: number,
  longitude: number,
): { sunPosition: GetSunPositionResult; moonPosition: GetMoonPositionResult } => {
  return {
    sunPosition: sunPosition(date, latitude, longitude),
    moonPosition: moonPosition(date, latitude, longitude),
  };
};
