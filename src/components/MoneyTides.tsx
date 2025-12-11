//#region types

import esri = __esri;

import type {
  ApiPrediction,
  ApiPredictionsResponse,
  ApiStationResponse,
  MoneyType,
  Prediction,
  Station,
  StationInfo,
  _StationInfo,
  ZoomToItem,
} from '../typings';

import type { GetTimesResult, GetMoonTimes, GetMoonIlluminationResult } from 'suncalc';

//#endregion

//#region components

import '@esri/calcite-components/dist/components/calcite-alert';
import '@esri/calcite-components/dist/components/calcite-button';
import '@esri/calcite-components/dist/components/calcite-dropdown';
import '@esri/calcite-components/dist/components/calcite-dropdown-group';
import '@esri/calcite-components/dist/components/calcite-dropdown-item';
import '@esri/calcite-components/dist/components/calcite-link';
import '@esri/calcite-components/dist/components/calcite-input-date-picker';
import '@esri/calcite-components/dist/components/calcite-shell';

//#endregion

//#region modules

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { createRenderer } from '@arcgis/core/smartMapping/renderers/heatmap';
import Graphic from '@arcgis/core/Graphic';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Color from '@arcgis/core/Color';
import Point from '@arcgis/core/geometry/Point';
import { DateTime } from 'luxon';
import { getTimes, getMoonTimes, getMoonIllumination } from 'suncalc';
import { moneyTypeColors, moneyColorsHeatmap } from './colorUtils';
import AboutModal from './AboutModal';
import Attribution from './Attribution';
import TidesDialog from './TidesDialog';

//#endregion

//#region constants

const CSS = {
  dialog: 'money-tides_dialog',
  header: 'money-tides_header',
  headerButtons: 'money-tides_header--buttons',
  headerDate: 'money-tides_header--date',
  headerTitle: 'money-tides_header--title',
  view: 'money-tides_view',
};

let KEY = 0;

const SYMBOL_NAME = new TextSymbol({
  text: '',
  color: 'black',
  font: {
    size: 12,
    weight: 'bold',
  },
  haloColor: 'white',
  haloSize: 1.5,
  horizontalAlignment: 'left',
  xoffset: 10,
});

const SYMBOL_POINT = new SimpleMarkerSymbol({
  style: 'circle',
  color: 'black',
  size: 10,
  outline: {
    color: 'white',
    width: 1.25,
  },
});

const SYMBOL_TIDES = new TextSymbol({
  text: '',
  color: 'black',
  font: {
    size: 12,
    weight: 'bold',
  },
  haloColor: 'white',
  haloSize: 1.5,
  horizontalAlignment: 'left',
  xoffset: 10,
  yoffset: -14,
});

//#endregion

//#region helpers

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
 * Return a date formatted for NOAA api requests, e.g. `2021204`.
 *
 * @param date Date or DateTime instance
 */
export const formatNOAADate = (date: Date | DateTime): string => {
  const _date = date instanceof Date ? DateTime.fromJSDate(date) : date;

  return _date.toFormat('yyyyLLdd');
};

export const getDateAtHour = (date: DateTime, hour: number): DateTime => {
  return date.set({ hour, minute: 0, second: 0, millisecond: 0 });
};

/**
 * Return a time of day string, e.g. `5:12 PM`
 *
 * @param date Date or DateTime instance
 */
export const twelveHourTime = (date: Date | DateTime): string => {
  const _date = date instanceof Date ? DateTime.fromJSDate(date) : date;

  return _date.toFormat('h:mm a');
};

//#endregion

@subclass('MoneyTides')
export default class MoneyTides extends Widget {
  //#region lifecycle

  _container = document.createElement('calcite-shell');

  get container(): HTMLCalciteShellElement {
    return this._container;
  }

  set container(value: HTMLCalciteShellElement) {
    this._container = value;
  }

  constructor(properties?: esri.WidgetProperties & { stationInfos: StationInfo[] | esri.Collection<StationInfo> }) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);

    const { zoomToDropdownItems } = this;

    this.addHandles(
      zoomToDropdownItems.on('after-add', (): void => {
        zoomToDropdownItems.sort((a: ZoomToItem, b: ZoomToItem): number => {
          if (a.name < b.name) return -1;

          if (a.name > b.name) return 1;

          return 0;
        });
      }),
    );
  }

  //#endregion

  //#region public properties

  @property({ type: Collection })
  public stationInfos: esri.Collection<_StationInfo> = new Collection();

  //#endregion

  //#region private properties

  private aboutModal = new AboutModal();

  private alerts: esri.Collection<tsx.JSX.Element> = new Collection();

  private date = getDateAtHour(DateTime.now().setZone('America/Los_Angeles'), 12);

  private datePicker!: HTMLCalciteInputDatePickerElement;

  private heatmapLayer!: esri.FeatureLayer;

  private tidesDialog = new TidesDialog();

  private stations: esri.Collection<Station> = new Collection();

  private view!: esri.MapView;

  private zoomToDropdownItems: esri.Collection<ZoomToItem> = new Collection();

  //#endregion

  //#region private methods

  private addZoomToItem(id: string, name: string): void {
    this.zoomToDropdownItems.add({
      name,
      element: (
        <calcite-dropdown-item key={KEY++} onclick={this.zoomTo.bind(this, `${id}`)}>
          {name}
        </calcite-dropdown-item>
      ),
    });
  }

  private createGraphics(
    id: string,
    latitude: number,
    longitude: number,
    moneyType: MoneyType,
    name: string,
    predictions: Prediction[],
    noonHeight: number,
  ): {
    graphicHeatmap: esri.Graphic;
    graphicName: esri.Graphic;
    graphicPoint: esri.Graphic;
    graphicTides: esri.Graphic;
  } {
    const {
      view,
      view: { graphics },
    } = this;

    const { primary, secondary } = moneyTypeColors(moneyType);

    const attributes = { id };

    const geometry = new Point({
      latitude,
      longitude,
    });

    const graphicHeatmap = new Graphic({
      attributes: { id, height: noonHeight },
      geometry,
    });

    if (!this.heatmapLayer) {
      this.createLayer(graphicHeatmap);
    } else {
      this.heatmapLayer.applyEdits({
        addFeatures: [graphicHeatmap],
      });
    }

    const graphicName = new Graphic({
      attributes,
      geometry,
      symbol: Object.assign(SYMBOL_NAME.clone(), { color: primary, haloColor: secondary, text: name }),
    });

    const graphicPoint = new Graphic({
      attributes,
      geometry,
      symbol: Object.assign(SYMBOL_POINT.clone(), {
        color: primary,
        outline: { color: secondary, width: SYMBOL_POINT.outline.width },
      }),
    });

    const graphicTides = new Graphic({
      attributes,
      geometry,
      symbol: Object.assign(SYMBOL_TIDES.clone(), {
        color: primary,
        haloColor: secondary,
        text: this.tidesSymbolText(predictions),
      }),
      visible: view.scale < 240000,
    });

    this.addHandles(
      watch(
        (): number => view.scale,
        (): void => {
          graphicTides.visible = view.scale < 240000;
        },
      ),
    );

    graphics.addMany([graphicName, graphicPoint, graphicTides]);

    return { graphicHeatmap, graphicName, graphicPoint, graphicTides };
  }

  private async createLayer(graphic: esri.Graphic): Promise<void> {
    const { view } = this;

    const layer = (this.heatmapLayer = new FeatureLayer({
      fields: [
        {
          name: 'OBJECTID',
          type: 'oid',
        },
        {
          name: 'id',
          type: 'string',
        },
        {
          name: 'height',
          type: 'double',
        },
      ],
      geometryType: 'point',
      objectIdField: 'OBJECTID',
      outFields: ['*'],
      source: [graphic],
      opacity: 0.7,
      visible: false,
    }));

    view.map?.add(layer);

    const renderer = (
      await createRenderer({
        layer,
        view,
        field: 'height',
        radius: 125,
        fadeRatio: 0.5,
        heatmapScheme: {
          colors: moneyColorsHeatmap,
          name: 'money',
          tags: ['money'],
          id: 'money',
          opacity: 1,
        },
      })
    ).renderer;

    renderer.referenceScale = 2000000;

    layer.renderer = renderer;
  }

  private getLinearNoonHeight(predictions: Prediction[]): number {
    let height: number | nullish;

    const noon = predictions[0].date.set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

    predictions.forEach((prediction: Prediction): void => {
      if (prediction.date.toFormat('h:mm a') === '12:00 PM') height = prediction.height;
    });

    if (!height) {
      // will always find these predictions given an array of predictions for a calendar day
      let proceeding!: Prediction;

      let upcoming!: Prediction;

      predictions.forEach((prediction: Prediction): void => {
        if (prediction.date.toMillis() < noon.toMillis()) proceeding = prediction;
      });

      upcoming = predictions[predictions.indexOf(proceeding) + 1];

      const { date: proceedingDate, height: startHeight } = proceeding;

      const { date: upcomingDate, height: endHeight } = upcoming;

      const startTime = proceedingDate.toMillis();

      const endTime = upcomingDate.toMillis();

      const time = noon.toMillis();

      // time does not fall between predictions
      if ((time < startTime && time < endTime) || (time > startTime && time > endTime)) {
        height = -999;
      } else {
        height = Number(
          (startHeight + ((endHeight - startHeight) * (time - startTime)) / (endTime - startTime)).toFixed(2),
        );
      }
    }

    return height || -999;
  }

  private getMoney(predictions: Prediction[]): { moneyType: MoneyType; moneyTideIndex: number } {
    // sort by height
    const _predictions: Prediction[] = predictions.toSorted((a: Prediction, b: Prediction): number => {
      return b.height - a.height;
    });

    const highestHigh: Prediction = _predictions[0];

    // may or may not have two high tides per day
    const lowestHigh: Prediction | null = _predictions[1].tideType === 'high' ? _predictions[1] : null;

    const highestRange = this.getTimeRange(highestHigh.date);

    const lowestRange = this.getTimeRange(lowestHigh?.date);

    const highestIndex = predictions.indexOf(highestHigh);

    const lowestIndex = lowestHigh ? predictions.indexOf(lowestHigh) : -1;

    if (highestRange === 2)
      return {
        moneyType: 'money',
        moneyTideIndex: highestIndex,
      };

    if (highestRange === 1)
      return {
        moneyType: 'mostly-money',
        moneyTideIndex: highestIndex,
      };

    if (lowestRange === 2)
      return {
        moneyType: 'kinda-money',
        moneyTideIndex: lowestIndex,
      };

    if (lowestRange === 1)
      return {
        moneyType: 'potentially-money',
        moneyTideIndex: lowestIndex,
      };

    return {
      moneyType: 'not-money',
      moneyTideIndex: -1,
    };
  }

  private async getPredictions(
    id: number | string,
    date: DateTime,
  ): Promise<{ moneyType: MoneyType; predictions: Prediction[]; noonHeight: number }> {
    const noaaDate = formatNOAADate(date);

    const url = createURL('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter', {
      product: 'predictions',
      format: 'json',
      interval: 'hilo', // only high and low tides
      time_zone: 'lst_ldt', // station local time adjusted for DST
      units: 'english',
      datum: 'mllw', // must use 'mean lower low water' b/c most stations are subordinate
      station: id,
      begin_date: noaaDate,
      end_date: noaaDate,
    });

    const predictionsResponse: ApiPredictionsResponse = await (await fetch(url)).json();

    const predictions: Prediction[] = predictionsResponse.predictions.map((prediction: ApiPrediction): Prediction => {
      const { t, v, type } = prediction;

      const date = DateTime.fromSQL(t).setZone('America/Los_Angeles') as DateTime<true>;

      return {
        date,
        height: Number(Number(v).toFixed(2)),
        moneyType: 'not-money',
        tideType: type === 'H' ? 'high' : 'low',
        time: twelveHourTime(date),
      };
    });

    const { moneyType, moneyTideIndex } = this.getMoney(predictions);

    if (moneyTideIndex !== -1) {
      predictions[moneyTideIndex].moneyType = moneyType;
    }

    const noonPrediction = predictions.find((prediction: Prediction): boolean => {
      return prediction.time === '12:00 PM';
    });

    const noonHeight = noonPrediction ? noonPrediction.height : this.getLinearNoonHeight(predictions);

    if (!noonPrediction) {
      predictions.push({
        date: getDateAtHour(date, 12),
        height: noonHeight,
        moneyType: 'not-money',
        time: '12:00 PM',
        tideType: 'noon',
      });

      predictions.sort((a: Prediction, b: Prediction): number => {
        return a.date.toMillis() - b.date.toMillis();
      });
    }

    return {
      moneyType,
      predictions,
      noonHeight,
    };
  }

  private getSunAndMoon(
    date: Date | DateTime,
    latitude: number,
    longitude: number,
  ): {
    sunTimes: GetTimesResult;
    moonTimes: GetMoonTimes;
    moonIllumination: GetMoonIlluminationResult;
  } {
    const _date = date instanceof Date ? date : date.toJSDate();

    return {
      sunTimes: getTimes(_date, latitude, longitude),
      moonTimes: getMoonTimes(_date, latitude, longitude),
      moonIllumination: getMoonIllumination(_date),
    };
  }

  private getTimeRange(date?: DateTime): 0 | 1 | 2 {
    if (!date) return 0;

    const time = date.toMillis();

    if (
      time >= date.set({ hour: 11, minute: 0, second: 0, millisecond: 0 }).toMillis() &&
      time <= date.set({ hour: 13, minute: 0, second: 0, millisecond: 0 }).toMillis()
    )
      return 2; // between 11 AM and 1 PM

    if (
      time >= date.set({ hour: 10, minute: 0, second: 0, millisecond: 0 }).toMillis() &&
      time <= date.set({ hour: 14, minute: 0, second: 0, millisecond: 0 }).toMillis()
    )
      return 1; // between 10 AM and 2 PM

    return 0;
  }

  private async loadStation(stationInfo: _StationInfo): Promise<Station | void> {
    const { stationId, stationName: name } = stationInfo;

    const date = this.date;

    try {
      const stationResponse: ApiStationResponse = await (
        await fetch(`https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${stationId}.json`)
      ).json();

      const { id, lat: latitude, lng: longitude } = stationResponse.stations[0];

      const { moneyType, predictions, noonHeight } = await this.getPredictions(id, date);

      const station = {
        date,
        id,
        latitude,
        longitude,
        moneyType,
        name,
        predictions,
        predictionUpdateError: false,
        predictionUpdateErrorCount: 0,
        noonHeight,
        ...this.createGraphics(id, latitude, longitude, moneyType, name, predictions, noonHeight),
        ...this.getSunAndMoon(date, latitude, longitude),
      };

      this.stations.add(station);

      stationInfo.loaded = true;

      this.addZoomToItem(id, name);

      return station;
    } catch (error) {
      console.log(error);

      if (stationInfo.loadErrorCount !== 3) {
        stationInfo.loadErrorCount++;

        this.loadStation(stationInfo);

        return;
      }

      stationInfo.loadErrorCount = 0;

      const alertId = `error-alert${this.id}-${KEY++}`;

      this.alerts.add(
        <calcite-alert icon="exclamation-mark-circle" id={alertId} key={KEY++} kind="danger" open scale="s">
          <div slot="message">Failed to load station data for {name}</div>
          <calcite-link
            slot="link"
            onclick={(): void => {
              this.loadStation(stationInfo);

              (document.getElementById(alertId) as HTMLCalciteAlertElement).open = false;
            }}
          >
            Try again
          </calcite-link>
        </calcite-alert>,
      );

      stationInfo.loaded = false;
    }
  }

  private tidesSymbolText(predictions: Prediction[]): string {
    return predictions
      .map((prediction: Prediction): string => {
        const { height, time, tideType } = prediction;

        return `${time} ${tideType} ${height} ft`;
      })
      .join('\n');
  }

  private async updatePredictions(station: Station): Promise<void> {
    const { date, tidesDialog } = this;

    const { id, latitude, longitude, name } = station;

    try {
      const { moneyType, predictions, noonHeight } = await this.getPredictions(id, date);

      station.predictionUpdateError = false;

      Object.assign(station, {
        date,
        noonHeight,
        moneyType,
        predictions,
        ...this.getSunAndMoon(date, latitude, longitude),
      });

      this.updateSymbols(station);

      if (tidesDialog.container.open && tidesDialog.station.id === id) {
        tidesDialog.show(station);
      }
    } catch (error) {
      console.log(error);

      if (station.predictionUpdateErrorCount !== 3) {
        station.predictionUpdateErrorCount++;

        this.updatePredictions(station);

        return;
      }

      station.predictionUpdateErrorCount = 0;

      const alertId = `error-alert${this.id}-${KEY++}`;

      this.alerts.add(
        <calcite-alert icon="exclamation-mark-circle" id={alertId} key={KEY++} kind="danger" open scale="s">
          <div slot="message">Failed to update predictions for {name}</div>
          <calcite-link
            slot="link"
            onclick={(): void => {
              this.updatePredictions(station);
              (document.getElementById(alertId) as HTMLCalciteAlertElement).open = false;
            }}
          >
            Try again
          </calcite-link>
        </calcite-alert>,
      );

      station.predictionUpdateError = true;

      this.updateSymbols(station);

      if (tidesDialog.container.open && tidesDialog.station.id === id) {
        tidesDialog.close();
      }
    }
  }

  private updateSymbols(station: Station): void {
    const {
      moneyType,
      predictions,
      graphicHeatmap,
      graphicName,
      graphicPoint,
      graphicTides,
      noonHeight,
      predictionUpdateError,
    } = station;

    let { primary, secondary } = moneyTypeColors(moneyType);

    if (predictionUpdateError) {
      primary = new Color('black');

      secondary = new Color('white');
    }

    graphicName.symbol = Object.assign((graphicName.symbol as esri.TextSymbol).clone(), {
      color: primary,
      haloColor: secondary,
    });

    graphicPoint.symbol = Object.assign((graphicPoint.symbol as esri.SimpleMarkerSymbol).clone(), {
      color: primary,
      outline: { color: secondary, width: SYMBOL_POINT.outline.width },
    });

    graphicTides.symbol = Object.assign((graphicTides.symbol as esri.TextSymbol).clone(), {
      color: predictionUpdateError ? null : primary,
      haloColor: predictionUpdateError ? null : secondary,
      text: this.tidesSymbolText(predictions),
    });

    // TODO handle error for heatmap layer
    Object.assign(graphicHeatmap.attributes, { height: noonHeight });

    this.heatmapLayer.applyEdits({
      updateFeatures: [graphicHeatmap],
    });
  }

  private zoomTo(id: string): void {
    const { view } = this;

    const station = this.stations.find((station: Station): boolean => {
      return station.id === id;
    });

    if (!station) return;

    view.goTo(station.graphicPoint);

    view.scale = 60000;

    this.tidesDialog.show(station);
  }

  //#endregion

  //#region events

  private dateChangeEvent(event: Event): void {
    this.date = getDateAtHour(
      DateTime.fromISO((event.target as HTMLCalciteInputDatePickerElement).value as string).setZone(
        'America/Los_Angeles',
      ),
      12,
    );

    this.stationInfos.forEach((stationInfo: _StationInfo): void => {
      if (!stationInfo.loaded) this.loadStation(stationInfo);
    });

    this.stations.forEach(this.updatePredictions.bind(this));
  }

  private dateButtonClickEvent(event: Event) {
    const type = (event.target as HTMLCalciteButtonElement).iconStart as 'chevron-left' | 'chevron-right';

    const date = (this.date = type === 'chevron-right' ? this.date.plus({ days: 1 }) : this.date.minus({ days: 1 }));

    this.datePicker.value = date.toISODate() as string;

    this.datePicker.dispatchEvent(new Event('calciteInputDatePickerChange'));
  }

  private async viewClickEvent(event: esri.ViewClickEvent): Promise<void> {
    event.stopPropagation();

    const { tidesDialog } = this;

    const result = (await this.view.hitTest(event, { include: [this.view.graphics] })).results[0];

    if (!result || result.type !== 'graphic') {
      tidesDialog.close();

      return;
    }

    const station = this.stations.find((station: Station): boolean => {
      return station.id === result.graphic.attributes.id;
    });

    if (!station || (station && station.predictionUpdateError)) return;

    tidesDialog.show(station);
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    const { alerts, zoomToDropdownItems } = this;

    return (
      <calcite-shell>
        {/* header */}
        <div class={CSS.header} slot="header">
          <div class={CSS.headerTitle}>Money Tides</div>

          <div class={CSS.headerDate}>
            <calcite-button
              icon-start="chevron-left"
              scale="s"
              onclick={this.dateButtonClickEvent.bind(this)}
            ></calcite-button>
            <calcite-input-date-picker
              overlay-positioning="fixed"
              scale="s"
              afterCreate={this.datePickerAfterCreate.bind(this)}
            ></calcite-input-date-picker>
            <calcite-button
              icon-start="chevron-right"
              scale="s"
              onclick={this.dateButtonClickEvent.bind(this)}
            ></calcite-button>
          </div>

          <div class={CSS.headerButtons}>
            <calcite-dropdown scale="s">
              <calcite-button icon-start="zoom-to-object" scale="s" slot="trigger"></calcite-button>
              <calcite-dropdown-group group-title="Zoom to" selection-mode="none">
                {zoomToDropdownItems
                  .map((zoomToItem: ZoomToItem): tsx.JSX.Element => {
                    return zoomToItem.element;
                  })
                  .toArray()}
              </calcite-dropdown-group>
            </calcite-dropdown>
            <calcite-button
              icon-start="information"
              scale="s"
              onclick={(): void => {
                this.aboutModal.open();
              }}
            ></calcite-button>
          </div>
        </div>

        {/* view */}
        <div class={CSS.view} afterCreate={this.viewAfterCreate.bind(this)}></div>

        {/* dialogs */}
        <div slot="dialogs">
          <calcite-dialog afterCreate={this.tidesDialogAfterCreate.bind(this)}></calcite-dialog>
          <calcite-dialog afterCreate={this.aboutModalAfterCreate.bind(this)}></calcite-dialog>
        </div>

        {/* alerts */}
        {alerts.length ? <div slot="alerts">{alerts.toArray()}</div> : null}
      </calcite-shell>
    );
  }

  private aboutModalAfterCreate(dialog: HTMLCalciteDialogElement): void {
    this.aboutModal.container = dialog;
  }

  private datePickerAfterCreate(datePicker: HTMLCalciteInputDatePickerElement): void {
    const today = this.date.toISODate() as string;

    datePicker.value = today;

    datePicker.addEventListener('calciteInputDatePickerChange', this.dateChangeEvent.bind(this));

    this.datePicker = datePicker;
  }

  private tidesDialogAfterCreate(dialog: HTMLCalciteDialogElement): void {
    this.tidesDialog.container = dialog;
  }

  private async viewAfterCreate(container: HTMLDivElement): Promise<void> {
    const { stationInfos } = this;

    const view = (this.view = new MapView({
      container,
      constraints: {
        rotationEnabled: false,
      },
      extent: {
        spatialReference: {
          wkid: 102100,
        },
        xmin: -13927811,
        ymin: 5308864,
        xmax: -13626955,
        ymax: 5844535,
      },
      map: new Map({
        basemap: 'topo-vector',
      }),
    }));

    view.ui.remove(['attribution', 'zoom']);

    view.ui.add(new Attribution({ container: document.createElement('calcite-action-bar'), view }), 'bottom-right');

    stationInfos.forEach((stationInfo: StationInfo): void => {
      this.loadStation({ ...stationInfo, loadErrorCount: 0 });
    });

    this.addHandles(view.on('click', this.viewClickEvent.bind(this)));

    this.emit('loaded');

    // setTimeout((): void => {
    //   console.log(view.extent.toJSON());
    // }, 10000);
  }

  //#endregion
}
