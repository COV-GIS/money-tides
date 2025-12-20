import esri = __esri;
import type { DateTime } from 'luxon';

declare namespace MT {
  //#region types

  /**
   * Response from magnetic declination api
   *
   * https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination
   */
  type ApiMagneticDeclinationResponse = {
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
  type ApiPrediction = {
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
  type ApiPredictionsResponse = {
    /**
     * Array of predictions
     */
    predictions: ApiPrediction[];
  };

  type GetTidesParameters = {
    date: DateTime;
    id: string;
    latitude: number;
    longitude: number;
  };

  type MoneyType = 'not-money' | 'potentially-money' | 'kinda-money' | 'mostly-money' | 'money';

  type StationGraphics = {
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

  type TideType =
    | 'high tide'
    | 'low tide'
    | 'lunar nadir'
    | 'lunar noon'
    | 'solar nadir'
    | 'moonrise'
    | 'moonset'
    | 'solar noon'
    | 'sunrise'
    | 'sunset';

  //#endregion

  //#region interfaces

  interface Moon {
    distance: number;
    illumination: number;
    illuminationPercent: string;
    moonrise?: DateTime;
    moonset?: DateTime;
    phase: number;
    phaseName: string;
  }

  interface Station {
    /**
     * Day of interest
     */
    date: DateTime;

    error: boolean;

    errorCount: number;

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
     * Sun info
     */
    sun: Sun;

    /**
     * Tides
     */
    tides: Tide[];
  }

  interface StationInfo {
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

  interface _StationInfo extends StationInfo {
    errorCount: number;

    /**
     * Is station loaded
     */
    loaded: boolean;
  }

  interface Sun {
    nadir: DateTime;
    solarNoon: DateTime;
    sunrise: DateTime;
    sunset: DateTime;
  }

  interface SunAndMoon {
    moon: Moon;
    sun: Sun;
  }

  interface SunMoonPosition {
    aboveHorizon: boolean;
    altitude: number;
    altitudeDegrees: string;
    azimuth: number;
    azimuthBearing: string;
    type: 'moon' | 'sun';
  }

  interface Tide {
    date: DateTime;

    height: number;

    heightLabel: string;

    /**
     * Tide is in day of interest
     */
    isDate: boolean;

    isLunar: boolean;

    /**
     * Tide is a NOAA prediction
     */
    isPrediction: boolean;

    isSolar: boolean;

    /**
     * Tide money
     */
    money: MoneyType;

    /**
     * Moon Position
     */
    moonPosition: SunMoonPosition;

    /**
     * Sun position
     */
    sunPosition: SunMoonPosition;

    time: string;

    type: TideType;
  }

  interface TideEvent {
    date: DateTime;
    event: TideType;
    type: 'lunar' | 'solar';
  }

  interface ZoomToItem {
    name: string;
    element: esri.widget.tsx.JSX.Element;
  }

  //#endregion
}
