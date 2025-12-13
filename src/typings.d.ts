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
 * Response from magnetic declination api
 * 
 * https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination
 */
export type ApiMagneticDeclinationResponse = {
  result: [{
    /**
     * Declination in degrees (positive E; negative W)
     */
    declination: number;
  }]
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
   * Station id
   */
  id: string;
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
   * Moon illumination (from earth)
   *
   * https://github.com/mourner/suncalc?tab=readme-ov-file#moon-illumination
   */
  moonIllumination: GetMoonIlluminationResult;
  /**
   * Moon times
   *
   * https://github.com/mourner/suncalc?tab=readme-ov-file#moon-rise-and-set-times
   */
  moonTimes: GetMoonTimes;
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
   * Sun times
   *
   * https://github.com/mourner/suncalc?tab=readme-ov-file#sunlight-times
   */
  sunTimes: GetTimesResult;
  /**
   * Three days of tides for the day in question and the days either side
   */
  tides: Tide[];
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

/**
 * Internal station info
 */
export interface _StationInfo extends StationInfo {
  /**
   * Is station loaded
   */
  loaded: boolean;
  /**
   * Number of consecutive load errors
   */
  loadErrorCount: number;
}

/**
 * Tide info
 */
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

/**
 * Sun time info
 */
export interface SunTimeInfo {
  /**
   * Altitude above the horizon of the sun
   */
  altitude: string;
  /**
   * Bearing to the sun
   */
  bearing: string;
  /**
   * Date/time of event
   */
  date: DateTime;
  /**
   * Tidal or sun event
   */
  event: string;
  /**
   * Event time, e.g. 5:12 PM
   */
  time: string;
}

/**
 * Tide time info
 */
export interface TideTimeInfo {
  /**
   * Date/time of event
   */
  date: DateTime;
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
  /**
   * Event time, e.g. 5:12 PM
   */
  time: string;
}

export type ZoomToItem = {
  name: string;
  element: esri.widget.tsx.JSX.Element;
};
