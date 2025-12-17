import esri = __esri;

import type { DateTime } from 'luxon';

import type { GetSunPositionResult, GetMoonPositionResult } from 'suncalc';

declare namespace __MT {
  /**
   * Response from magnetic declination api
   *
   * https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination
   */
  export type ApiMagneticDeclinationResponse = {
    result: [
      {
        /**
         * Declination in degrees (positive E; negative W)
         */
        declination: number;
      },
    ];
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
   * Money types
   */
  export type MoneyType = 'not-money' | 'potentially-money' | 'kinda-money' | 'mostly-money' | 'money';

  /**
   * Tide types
   */
  export type TideType = 'high tide' | 'low tide' | 'moonrise' | 'moonset' | 'solar noon' | 'sunrise' | 'sunset';

  export type StationGraphics = {
    /**
     * Heatmap feature layer graphic
     */
    heatmapGraphic: esri.Graphic;

    /**
     * Marker graphic
     */
    markerGraphic: esri.Graphic;

    /**
     * Station name graphic
     */
    stationGraphic: esri.Graphic;

    /**
     * Tides graphic
     */
    tidesGraphic: esri.Graphic;
  };

  export interface Station {
    /**
     * Day of interest
     */
    date: DateTime;

    /**
     * Id of calcite error alert
     */
    errorAlertId: string;

    /**
     * Station graphics
     */
    graphics: StationGraphics;

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
     * Day money
     */
    money: MoneyType;

    /**
     * Moon info
     */
    moon: Moon;

    /**
     * Station name
     */
    name: string;

    /**
     * Last prediction update failed if `true`
     */
    predictionUpdateError: boolean;

    /**
     * Number of consecutive update errors
     */
    predictionUpdateErrorCount: number;

    /**
     * Sun info
     */
    sun: Sun;

    /**
     * Tides
     */
    tides: Tide[];
  }

  export interface StationInfo {
    /**
     * Station id
     */
    id: string;

    /**
     * Station y coordinate
     */
    latitude: number;

    /**
     * Station x coordinate
     */
    longitude: number;

    /**
     * Station name
     */
    name: string;
  }

  export interface _StationInfo extends StationInfo {
    /**
     * Id of calcite error alert
     */
    errorAlertId: string;

    /**
     * Is station loaded
     */
    loaded: boolean;

    /**
     * Number of consecutive load errors
     */
    loadErrorCount: number;
  }

  export interface Tide {
    date: DateTime;

    height: number;

    heightLabel: string;

    /**
     * Tide is in day of interest
     */
    isDate: boolean;

    /**
     * Tide is a NOAA prediction
     */
    isPrediction: boolean;

    /**
     * Tide money
     */
    money: MoneyType;

    /**
     * Moon Position
     */
    moonPosition: MoonPosition;

    /**
     * Sun position
     */
    sunPosition: SunPosition;

    time: string;

    type: TideType;
  }

  interface SharedSunMoonPosition {
    aboveHorizon: boolean;
    altitude: string;
    bearing: string;
  }

  export interface SunPosition extends SharedSunMoonPosition {
    position: GetSunPositionResult;
  }

  export interface MoonPosition extends SharedSunMoonPosition {
    position: GetMoonPositionResult;
  }

  export interface Moon {
    distance: number,
    illumination: number;
    illuminationPercent: string;
    moonrise?: DateTime;
    moonset?: DateTime;
    phase: number;
    phaseName: string;
  }

  export interface Sun {
    solarNoon: DateTime;
    sunrise: DateTime;
    sunset: DateTime;
  }

  export interface SunAndMoon {
    moon: Moon;
    sun: Sun;
  }

  export interface TideEvent {
    date: DateTime;
    event: TideType;
  }

  export interface GetTidesParameters {
    date: DateTime;
    id: string;
    latitude: number;
    longitude: number;
    tideEvents: TideEvent[];
  }

  export interface ZoomToItem {
    name: string;
    element: esri.widget.tsx.JSX.Element;
  }
}
