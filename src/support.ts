import esri = __esri;

import type { I } from './typings';

import { byName } from '@arcgis/core/smartMapping/symbology/support/colorRamps';
import Color from '@arcgis/core/Color';
import { DateTime } from 'luxon';

//#region constants

/**
 * Array of money colors.
 */
export const moneyColors = (byName('Red and Green 9') as esri.supportColorRampsColorRamp).colors;

/**
 * Array of money colors for heatmaps.
 */
export const moneyColorsHeatmap = (byName('Blue 2') as esri.supportColorRampsColorRamp).colorsForClassBreaks[9]
  .colors as esri.Color[];

/**
 * Array of money types.
 */
export const moneyTypes: I['money'][] = ['not-money', 'potentially-money', 'kinda-money', 'mostly-money', 'money'];

//#endregion

//#region methods

/**
 * Create a URL.
 *
 * @param base - base URL
 * @param params - query string params
 */
export const createURL = (base: string, params: { [key: string]: string | number }): string => {
  const url = new URL(base);

  Object.entries(params).forEach(([key, value]): void => {
    url.searchParams.append(key, String(value));
  });

  return url.toString();
};

/**
 * Get primary and secondary tide colors by money type.
 *
 * @param money - money type
 */
export const getMoneyColors = (money: I['money']): { primary: esri.Color; secondary: esri.Color } => {
  const primary = moneyColors[moneyTypes.indexOf(money)] as esri.Color & { isBright: boolean };

  return {
    primary,
    secondary: new Color(primary.isBright ? [0, 0, 0] : [255, 255, 255]),
  };
};

/**
 * Create station home page url and optionally open in new window.
 *
 * @param id - station id
 * @param open - open url in new window
 */
export const stationHome = (id: number | string, open?: boolean): string => {
  const url = `https://tidesandcurrents.noaa.gov/stationhome.html?id=${id}`;

  if (open === true) window.open(url, '_blank');

  return url;
};

/**
 * Create station prediction page url and optionally open in new window.
 *
 * @param id - station id
 * @param date - ISO date
 * @param days - number of days of predictions to display
 * @param open - open url in new window
 */
export const stationPredictions = (id: number | string, date: string, days: number, open?: boolean): string => {
  const start = DateTime.fromISO(date);

  const end = days === 1 ? start : start.plus({ days: days - 1 });

  const url = `https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=${id}&units=standard&bdate=${toNOAADate(
    start,
  )}&edate=${toNOAADate(end)}&timezone=LST/LDT&clock=12hour&datum=MLLW&interval=hilo&action=dailychart`;

  if (open === true) window.open(url, '_blank');

  return url;
};

/**
 * Return a date formatted for NOAA api requests, e.g. YYYYMMDD (2021204).
 *
 * @param date DateTime instance to format
 */
export const toNOAADate = (date: DateTime): string => {
  return date.toFormat('yyyyLLdd');
};

//#endregion
