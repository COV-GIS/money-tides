import esri = __esri;
import { MT } from '../interfaces';

import Color from '@arcgis/core/Color';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import { moneyTypeColors } from './colorUtils';
import { crabPot21 } from 'calcite-point-symbols/js/crabPot21.js';

const SYMBOL_CRAB = new SimpleMarkerSymbol({
  size: 12,
  outline: {
    width: 0,
  },
  path: crabPot21,
});

const SYMBOL_MARKER = new SimpleMarkerSymbol({
  style: 'circle',
  size: 18,
  outline: {
    width: 1,
  },
});

const SYMBOL_STATION = new TextSymbol({
  font: {
    size: 12,
  },
  haloSize: 1.75,
  horizontalAlignment: 'left',
  verticalAlignment: 'middle',
  xoffset: 12,
});

const SYMBOL_TIDES = new TextSymbol({
  font: {
    size: 12,
  },
  haloSize: 1.75,
  horizontalAlignment: 'left',
  verticalAlignment: 'top',
  xoffset: 12,
  yoffset: -9,
});

export const getSymbols = (params: {
  money: MT.MoneyType;
  name: string;
  tides: MT.Tide[];
}): {
  crabSymbol: esri.SimpleMarkerSymbol;
  markerSymbol: esri.SimpleMarkerSymbol;
  stationSymbol: esri.TextSymbol;
  tidesSymbol: esri.TextSymbol;
} => {
  const { money, name, tides } = params;

  const { primary, secondary } = moneyTypeColors(money);

  const crabSymbol = Object.assign(SYMBOL_CRAB.clone(), { color: primary });

  const markerSymbol = Object.assign(SYMBOL_MARKER.clone(), {
    color: secondary,
    outline: { color: primary, width: SYMBOL_MARKER.outline.width },
  });

  const stationSymbol = Object.assign(SYMBOL_STATION.clone(), { color: primary, haloColor: secondary, text: name });

  const tidesSymbol = Object.assign(SYMBOL_TIDES.clone(), {
    color: primary,
    haloColor: secondary,
    text: tidesSymbolText(tides),
  });

  return { crabSymbol, markerSymbol, stationSymbol, tidesSymbol };
};

const tidesSymbolText = (tides: MT.Tide[]): string => {
  return tides
    .filter((tide: MT.Tide): boolean => {
      return tide.isPrediction && tide.isDate;
    })
    .map((tide: MT.Tide): string => {
      const { heightLabel, time, type } = tide;

      return `${time} ${type} ${heightLabel}`;
    })
    .join('\n');
};

export const updateSymbols = (params: {
  error?: boolean;
  money: MT.MoneyType;
  name: string;
  tides: MT.Tide[];
}): {
  crabSymbol: esri.SimpleMarkerSymbol;
  markerSymbol: esri.SimpleMarkerSymbol;
  stationSymbol: esri.TextSymbol;
  tidesSymbol: esri.TextSymbol;
} => {
  const { error, money, name, tides } = params;

  let { primary, secondary } = moneyTypeColors(money);

  if (error) {
    primary = new Color('black');

    secondary = new Color('white');
  }

  const crabSymbol = Object.assign(SYMBOL_CRAB.clone(), { color: primary });

  const markerSymbol = Object.assign(SYMBOL_MARKER.clone(), {
    color: secondary,
    outline: { color: primary, width: SYMBOL_MARKER.outline.width },
  });

  const stationSymbol = Object.assign(SYMBOL_STATION.clone(), { color: primary, haloColor: secondary, text: name });

  const tidesSymbol = Object.assign(SYMBOL_TIDES.clone(), {
    color: error ? null : primary,
    haloColor: error ? null : secondary,
    text: tidesSymbolText(tides),
  });

  return { crabSymbol, markerSymbol, stationSymbol, tidesSymbol };
};
