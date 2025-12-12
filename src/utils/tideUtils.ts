import type { Prediction, Tide } from '../typings';
import type { DateTime } from 'luxon';

import { setNoon } from './dateAndTimeUtils';

export const tideHeightAtNoon = (predictions: Prediction[]): number => {
  let height: number | nullish;

  predictions.forEach((prediction: Prediction): void => {
    if (prediction.date.toFormat('h:mm a') === '12:00 PM') height = prediction.height;
  });

  if (height) return height;

  return tideHeightAtTime(predictions, setNoon(predictions[0].date));
};

export const tideHeightAtTime = (predictions: Prediction[] | Tide[], date: DateTime): number => {
  let height = -999;

  let proceeding: Prediction | Tide | nullish;

  let upcoming: Prediction | Tide | nullish;

  predictions.forEach((prediction: Prediction | Tide): void => {
    if (prediction.date.toMillis() < date.toMillis()) proceeding = prediction;
  });

  if (!proceeding) return -999;

  // @ts-expect-error need to fix this error
  upcoming = predictions[predictions.indexOf(proceeding) + 1];

  if (!upcoming) return -999;

  const { date: proceedingDate, height: startHeight } = proceeding;

  const { date: upcomingDate, height: endHeight } = upcoming;

  const startTime = proceedingDate.toMillis();

  const endTime = upcomingDate.toMillis();

  const time = date.toMillis();

  // time does not fall between predictions
  if ((time < startTime && time < endTime) || (time > startTime && time > endTime)) {
    height = -999;
  } else {
    height = Number(
      (startHeight + ((endHeight - startHeight) * (time - startTime)) / (endTime - startTime)).toFixed(2),
    );
  }

  return height;
};
