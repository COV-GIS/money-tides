import type { MT } from '../interfaces';
import type { DateTime } from 'luxon';

export const tideHeight = (tides: MT.Tide[], date: DateTime): number => {
  const _tides = tides.filter((tide: MT.Tide): boolean => {
    return tide.isPrediction;
  });

  const height = -999;

  let proceeding: MT.Tide | nullish;

  _tides.forEach((tide: MT.Tide): void => {
    if (tide.date.toMillis() < date.toMillis()) proceeding = tide;
  });

  if (!proceeding) return height;

  const upcoming: MT.Tide | nullish = _tides[_tides.indexOf(proceeding) + 1];

  if (!upcoming) return height;

  const { date: proceedingDate, height: startHeight } = proceeding;

  const { date: upcomingDate, height: endHeight } = upcoming;

  const startTime = proceedingDate.toMillis();

  const endTime = upcomingDate.toMillis();

  const time = date.toMillis();

  // time does not fall between predictions
  if ((time < startTime && time < endTime) || (time > startTime && time > endTime)) {
    return height;
  } else {
    return Number((startHeight + ((endHeight - startHeight) * (time - startTime)) / (endTime - startTime)).toFixed(2));
  }
};
