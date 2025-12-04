import esri = __esri;

import type { DateTime } from 'luxon';

type I = {
  /**
   * Is the tide money
   */
  money: 0 | 1 | 2 | 3 | 4;
};

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
   * Is the tide money
   */
  // money: I['money'];
  /**
   * Tide time, e.g. 5:12 PM
   */
  time: string;
  /**
   * Tide type
   */
  type: 'high' | 'low';
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
   * Iso date
   */
  dateIso: string;
  /**
   * Noaa date (yyyymmdd)
   */
  dateNoaa: string;
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
   * Is the tide money
   */
  money: I['money'];
  /**
   *  Tides for the date
   */
  predictions: Prediction[];
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
   * Station name (optional)
   *
   * Overrides noaa station name
   */
  stationName?: string;
};
