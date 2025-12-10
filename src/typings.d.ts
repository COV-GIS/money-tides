import esri = __esri;

import type { DateTime } from 'luxon';
import type { GetTimesResult, GetMoonTimes, GetMoonIlluminationResult } from 'suncalc';

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
export type Prediction = {
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
   * Tide type
   */
  tideType: 'high' | 'low' | 'noon';
  /**
   * Tide time, e.g. 5:12 PM
   */
  time: string;
};

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
   * Sun times.
   *
   * https://github.com/mourner/suncalc?tab=readme-ov-file#sunlight-times
   */
  sunTimes: GetTimesResult;
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
export type StationInfo = {
  /**
   * Station id
   */
  stationId: number | string;
  /**
   * Station name
   */
  stationName: string;
};

/**
 * Time info
 */
export type TimeInfo = {
  /**
   * Date/time of event
   */
  date: DateTime;
  /**
   * Description of event
   */
  description: string;
  /**
   * Table row style
   */
  style?: string;
  /**
   * Event time, e.g. 5:12 PM
   */
  time: string;
  /**
   * Event value
   */
  value?: string;
};
