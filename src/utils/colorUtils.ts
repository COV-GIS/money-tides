import esri = __esri;
import type { MT } from '../interfaces';

import { byName } from '@arcgis/core/smartMapping/symbology/support/colorRamps';
import Color from '@arcgis/core/Color';

/**
 * Array of money colors.
 */
export const moneyColors = (byName('Red and Green 9') as esri.supportColorRampsColorRamp).colors;

/**
 * Array of money colors for heatmap.
 */
export const moneyColorsHeatmap = (byName('Blue 2') as esri.supportColorRampsColorRamp).colorsForClassBreaks[9]
  .colors as esri.Color[];

/**
 * Array of money types by array index; `not-money = 0`, `potentially-money = 1`, etc.
 *
 * Useful for getting money colors by index.
 */
export const moneyTypeIndex = [
  'not-money',
  'potentially-money',
  'kinda-money',
  'mostly-money',
  'money',
];

/**
 * Return tide color by money type in hex or a style.
 *
 * @param moneyType - money type
 * @param className - optional class name
 */
export const moneyTypeColorHex = (moneyType: MT.MoneyType, className?: string): string => {
  const hex = (moneyColors[moneyTypeIndex.indexOf(moneyType)] as esri.Color).toHex();

  if (className) return `${className}: ${hex};`;

  return hex;
};

/**
 * Return primary and secondary tide colors by money type.
 *
 * @param moneyType - money type
 */
export const moneyTypeColors = (moneyType: MT.MoneyType): { primary: esri.Color; secondary: esri.Color } => {
  const primary = moneyColors[moneyTypeIndex.indexOf(moneyType)] as esri.Color & { isBright: boolean };

  return {
    primary,
    secondary: new Color(primary.isBright ? [0, 0, 0] : [255, 255, 255]),
  };
};
