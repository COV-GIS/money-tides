import esri = __esri;
import type { MT } from '../interfaces';

import { byName } from '@arcgis/core/smartMapping/symbology/support/colorRamps';
import Color from '@arcgis/core/Color';
import { applicationSettings } from '../app-config';

/**
 * Array of money colors.
 */
export const moneyColors = (byName('Red and Green 9') as esri.supportColorRampsColorRamp).colors;

/**
 * Array of money types by array index; `not-money = 0`, `potentially-money = 1`, etc.
 *
 * Useful for getting money colors by index.
 */
export const moneyTypeIndex = ['not-money', 'potentially-money', 'kinda-money', 'mostly-money', 'money'];

/**
 * Return the value of any style of the document body.
 *
 * @param style - stayle name
 * @param colorOptions - optional options to format style value as a color.
 */
export const getDocumentStyle = (style: string, colorOptions?: { opacity?: number; type: 'hex' | 'rgba' }): string => {
  const value = getComputedStyle(document.body).getPropertyValue(style);

  if (!colorOptions) return value;

  const { opacity, type } = colorOptions;

  const color = new Color(value);

  color.a = opacity || 1;

  return type === 'hex' ? color.toHex({ digits: 8 }) : color.toCss(true);
};

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

  if (applicationSettings.colorType === 'light' && primary.toHex({ digits: 6 }) === '#ffffbf') {
    return {
      primary: new Color([64, 64, 64]),
      secondary: primary,
    };
  }

  return {
    primary,
    secondary: applicationSettings.colorType === 'dark' ? new Color([32, 32, 32]) : new Color([255, 255, 255]),
  };
};
