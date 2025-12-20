import { DateTime } from 'luxon';

export default DateTime;

/**
 * Return a date formatted for NOAA api requests, e.g. `2021204`.
 *
 * @param date Date or DateTime instance
 */
export const NOAADate = (date: DateTime): string => {
  return date.toFormat('yyyyLLdd');
};

/**
 * Return a new DateTime instance at noon.
 *
 * @param date DateTime instance
 */
export const setNoon = (date: DateTime): DateTime => {
  return setTime(date, { hour: 12 });
};

/**
 * Return a new DateTime instance with the specified time.
 *
 * Note: time parameters default to `0` if not provided.
 *
 * @param date - DateTime instance
 * @param time - time parameters to set
 */
export const setTime = (
  date: DateTime,
  time: { hour?: number; minute?: number; second?: number; millisecond?: number },
): DateTime => {
  const _time = { hour: 0, minute: 0, second: 0, millisecond: 0, ...time };

  return date.set(_time);
};

/**
 * Return a time of day string in 12 hour format, e.g. `5:12 PM`.
 *
 * @param date - DateTime instance
 */
export const twelveHourTime = (date: DateTime): string => {
  return date.toFormat('h:mm a');
};

/**
 * Return a time of day string in 24 hour format, e.g. `17:36`.
 *
 * @param date - DateTime instance
 * @param pad - zero pad time
 */
export const twentyFourHourTime = (date: DateTime, pad?: boolean): string => {
  return date.toFormat(pad ? 'HH' : 'H');
};
