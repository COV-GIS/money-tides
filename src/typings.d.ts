import esri = __esri;

import type { DateTime } from 'luxon';
import type {
  GetSunPositionResult,
  GetTimesResult,
  GetMoonPositionResult,
  GetMoonTimes,
  GetMoonIlluminationResult,
} from 'suncalc';

/**
 * Api tide prediction
 */
export type ApiPrediction = {
  /**
   * Sql time (always local time, e.g. lst_ldt)
   */
  t: string;
  /**
   * Vertical difference from mean lower low water (mllw)
   */
  v: string;
  /**
   * Tide type
   */
  type: 'H' | 'L';
};

/**
 * Response from predictions api
 *
 * Api docs: https://api.tidesandcurrents.noaa.gov/api/prod
 */
export type ApiPredictionsResponse = {
  /**
   * Array of predictions
   */
  predictions: ApiPrediction[];
};

/**
 * Response from station api
 *
 * Api docs: https://api.tidesandcurrents.noaa.gov/mdapi/prod/
 */
export type ApiStationResponse = {
  /**
   * Array of stations (just the one you requested)
   */
  stations: {
    /**
     * Station id
     */
    id: string;
    /**
     * Station latitude
     */
    lat: number;
    /**
     * Station longitude
     */
    lng: number;
    /**
     * Station name
     */
    name: string;
  }[];
};

/**
 * Money types.
 */
export type MoneyType = 'not-money' | 'potentially-money' | 'kinda-money' | 'mostly-money' | 'money';

/**
 * Array of money types by array index; `not-money = 0`, `potentially-money = 1`, etc.
 *
 * Useful for getting money colors by index.
 */
export type MoneyTypeIndex = ['not-money', 'potentially-money', 'kinda-money', 'mostly-money', 'money'];

/**
 * Tide prediction
 */
export interface Prediction {
  /**
   * Tide height
   */
  height: number;
  /**
   * Tide date
   */
  date: DateTime;
  /**
   * Tide money type
   */
  moneyType: MoneyType;
  /**
   * Position of the moon
   */
  moonPosition: GetMoonPositionResult;
  /**
   * Sun position
   */
  sunPosition: GetSunPositionResult;
  /**
   * Tide type
   */
  tideType: 'high' | 'low' | 'noon';
  /**
   * Tide time, e.g. 5:12 PM
   */
  time: string;
}

/**
 * Station
 */
export type Station = {
  /**
   * Station id
   */
  id: string;
  /**
   * Date of predictions
   */
  date: DateTime;
  /**
   * Station noon height graphic for heatmap.
   */
  graphicHeatmap: esri.Graphic;
  /**
   * Station name graphic
   */
  graphicName: esri.Graphic;
  /**
   * Station point graphic
   */
  graphicPoint: esri.Graphic;
  /**
   * Station tides graphic
   */
  graphicTides: esri.Graphic;
  /**
   * Station latitude
   */
  latitude: number;
  /**
   * Station longitude
   */
  longitude: number;
  /**
   * Station name
   */
  name: string;
  /**
   * Tide height at noon (linear).
   */
  noonHeight: number;
  /**
   * Day money type
   */
  moneyType: MoneyType;
  /**
   *  Tide predictions for the date
   */
  predictions: Prediction[];
  /**
   * Last prediction update failed if `true`
   */
  predictionUpdateError: boolean;
  /**
   * Number of consecutive update errors
   */
  predictionUpdateErrorCount: number;
  /**
   * Sun times.
   *
   * https://github.com/mourner/suncalc?tab=readme-ov-file#sunlight-times
   */
  sunTimes: GetTimesResult;
  /**
   * Three days of tides for the day in question and the days either side
   */
  tides: Tide[];
  /**
   * Moon times.
   *
   * https://github.com/mourner/suncalc?tab=readme-ov-file#moon-rise-and-set-times
   */
  moonTimes: GetMoonTimes;
  /**
   * Moon illumination (from earth).
   *
   * https://github.com/mourner/suncalc?tab=readme-ov-file#moon-illumination
   */
  moonIllumination: GetMoonIlluminationResult;
};

/**
 * Station info
 */
export interface StationInfo {
  /**
   * Station id
   */
  stationId: number | string;
  /**
   * Station name
   */
  stationName: string;
}

export interface _StationInfo extends StationInfo {
  loaded?: boolean;
  /**
   * Number of consecutive load errors
   */
  loadErrorCount: number;
}

export type Tide = {
  /**
   * Date/time of time
   */
  date: DateTime;
  /**
   * Height of tide
   */
  height: number;
};

export interface TideSunAndMoonPositionInfo extends Prediction {
  sunPosition: GetSunPositionResult;
  moonPosition: GetMoonPositionResult;
}

interface TimeInfo {
  /**
   * Date/time of event
   */
  date: DateTime;
  /**
   * Event time, e.g. 5:12 PM
   */
  time: string;
}

export interface SunTimeInfo extends TimeInfo {
  /**
   * Tidal event
   */
  event: string;
}

/**
 * Time info
 */
export interface TideTimeInfo extends TimeInfo {
  /**
   * Tidal event
   */
  event: string;
  /**
   * Tide height
   */
  height: string;
  /**
   * Table row style
   */
  style?: string;
}

export type ZoomToItem = {
  name: string;
  element: esri.widget.tsx.JSX.Element;
};
