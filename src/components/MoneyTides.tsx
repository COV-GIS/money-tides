//#region types

import esri = __esri;

import type {
  ApiPrediction,
  ApiPredictionsResponse,
  // ApiStationResponse,
  MoneyType,
  Prediction,
  Station,
  StationInfo,
  _StationInfo,
  Tide,
  ZoomToItem,
  ZZZStation,
  ZZZTide,
} from '../typings';

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
import { moneyTypeColors, moneyColorsHeatmap } from '../utils/colorUtils';
import DateTime, { NOAADate, setNoon, setTime, twelveHourTime } from '../utils/dateAndTimeUtils';
import { moonPosition, sunPosition, todaysSunAndMoon, sunAndMoonPosition } from '../utils/sunAndMoonUtils';
import { tideHeightAtNoon } from '../utils/tideUtils';
import createURL from '../utils/createURL';
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

  private date = setNoon(DateTime.now().setZone('America/Los_Angeles'));

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
        <calcite-dropdown-item
          key={KEY++}
          onclick={(): void => {
            const { view } = this;

            const station = this.stations.find((station: Station): boolean => {
              return station.id === id;
            });

            if (!station) return;

            view.goTo(station.graphicPoint);

            view.scale = 60000;

            this.tidesDialog.open(station);
          }}
        >
          {name}
        </calcite-dropdown-item>
      ),
    });
  }

  private createGraphics(createGraphicsParameters: {
    id: string;
    latitude: number;
    longitude: number;
    moneyType: MoneyType;
    name: string;
    noonHeight: number;
    predictions: Prediction[];
  }): {
    graphicHeatmap: esri.Graphic;
    graphicName: esri.Graphic;
    graphicPoint: esri.Graphic;
    graphicTides: esri.Graphic;
  } {
    const {
      view,
      view: { graphics },
    } = this;

    const { id, latitude, longitude, moneyType, name, noonHeight, predictions } = createGraphicsParameters;

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
    id: string,
    date: DateTime,
    latitude: number,
    longitude: number,
  ): Promise<{ moneyType: MoneyType; noonHeight: number; predictions: Prediction[]; tides: Tide[] }> {
    const url = createURL('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter', {
      product: 'predictions',
      format: 'json',
      interval: 'hilo', // only high and low tides
      time_zone: 'lst_ldt', // station local time adjusted for DST
      units: 'english',
      datum: 'mllw', // must use 'mean lower low water' b/c most stations are subordinate
      station: id,
      begin_date: NOAADate(date.minus({ day: 1 })),
      end_date: NOAADate(date.plus({ day: 1 })),
    });

    const predictionsResponse: ApiPredictionsResponse = await (await fetch(url)).json();

    const predictions: Prediction[] = [];

    const tides: Tide[] = [];

    predictionsResponse.predictions.forEach((prediction: ApiPrediction): void => {
      const { t, v, type } = prediction;

      const tideDate = DateTime.fromSQL(t).setZone('America/Los_Angeles') as DateTime;

      const height = Number(Number(v).toFixed(2));

      if (date.hasSame(tideDate, 'day'))
        predictions.push({
          date: tideDate,
          height,
          moneyType: 'not-money',
          moonPosition: moonPosition(tideDate, latitude, longitude),
          sunPosition: sunPosition(tideDate, latitude, longitude),
          tideType: type === 'H' ? 'high' : 'low',
          time: twelveHourTime(tideDate),
        });

      tides.push({
        date: tideDate,
        height,
      });
    });

    const { moneyType, moneyTideIndex } = this.getMoney(predictions);

    if (moneyTideIndex !== -1) {
      predictions[moneyTideIndex].moneyType = moneyType;
    }

    const noonPrediction = predictions.find((prediction: Prediction): boolean => {
      return prediction.time === '12:00 PM';
    });

    const noonHeight = noonPrediction ? noonPrediction.height : tideHeightAtNoon(predictions);

    if (!noonPrediction) {
      const noonDate = setNoon(date);

      predictions.push({
        date: noonDate,
        height: noonHeight,
        moneyType: 'not-money',
        moonPosition: moonPosition(noonDate, latitude, longitude),
        sunPosition: sunPosition(noonDate, latitude, longitude),
        time: '12:00 PM',
        tideType: 'noon',
      });

      predictions.sort((a: Prediction, b: Prediction): number => {
        return a.date.toMillis() - b.date.toMillis();
      });
    }

    return {
      moneyType,
      noonHeight,
      predictions,
      tides,
    };
  }

  private getTimeRange(date?: DateTime): 0 | 1 | 2 {
    if (!date) return 0;

    const time = date.toMillis();

    // between 11 AM and 1 PM
    if (time >= setTime(date, { hour: 11 }).toMillis() && time <= setTime(date, { hour: 13 }).toMillis()) return 2;

    // between 10 AM and 2 PM
    if (time >= setTime(date, { hour: 10 }).toMillis() && time <= setTime(date, { hour: 14 }).toMillis()) return 1;

    return 0;
  }

  private async loadStation(stationInfo: _StationInfo): Promise<Station | void> {
    const { id, latitude, longitude, name } = stationInfo;

    const date = this.date;

    try {
      const { noonHeight, moneyType, predictions, tides } = await this.getPredictions(id, date, latitude, longitude);

      const station = {
        date,
        id,
        latitude,
        longitude,
        moneyType,
        name,
        noonHeight,
        predictions,
        predictionUpdateError: false,
        predictionUpdateErrorCount: 0,
        tides,
        ...this.createGraphics({ id, latitude, longitude, moneyType, name, noonHeight, predictions }),
        ...todaysSunAndMoon(date, latitude, longitude),
      };

      this.stations.add(station);

      stationInfo.loaded = true;

      stationInfo.loadErrorCount = 0;

      this.addZoomToItem(id, name);

      return station;
    } catch (error) {
      // console.log(error);

      if (stationInfo.loadErrorCount !== 10) {
        stationInfo.loadErrorCount++;

        setTimeout((): void => {
          this.loadStation(stationInfo);
        }, stationInfo.loadErrorCount * 100);

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
      const { moneyType, noonHeight, predictions, tides } = await this.getPredictions(id, date, latitude, longitude);

      station.predictionUpdateError = false;

      station.predictionUpdateErrorCount = 0;

      Object.assign(station, {
        date,
        noonHeight,
        moneyType,
        predictions,
        tides,
        ...todaysSunAndMoon(date, latitude, longitude),
      });

      this.updateSymbols(station);

      if (tidesDialog.container.open && tidesDialog.station.id === id) {
        tidesDialog.open(station);
      }
    } catch (error) {
      console.log(error);

      if (station.predictionUpdateErrorCount !== 10) {
        setTimeout((): void => {
          station.predictionUpdateErrorCount++;

          this.updatePredictions(station);
        }, station.predictionUpdateErrorCount * 100);

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

  //#endregion

  //#region events

  private dateChangeEvent(event: Event): void {
    this.date = setNoon(
      DateTime.fromISO((event.target as HTMLCalciteInputDatePickerElement).value as string).setZone(
        'America/Los_Angeles',
      ),
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

    tidesDialog.open(station);
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
        <calcite-dialog slot="dialogs" afterCreate={this.tidesDialogAfterCreate.bind(this)}></calcite-dialog>
        <calcite-dialog slot="dialogs" afterCreate={this.aboutModalAfterCreate.bind(this)}></calcite-dialog>

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
      this.loadStation({ ...stationInfo, loaded: false, loadErrorCount: 0 });
    });

    this.addHandles(view.on('click', this.viewClickEvent.bind(this)));

    this.emit('loaded');

    // setTimeout((): void => {
    //   console.log(view.extent.toJSON());
    // }, 10000);

    // setTimeout((): void => {
    //   const stations = this.stations.map((station: Station): any => {
    //     return {
    //       id: station.id,
    //       latitude: Number(station.latitude.toFixed(3)),
    //       longitude: Number(station.longitude.toFixed(3)),
    //       name: station.name,
    //     };
    //   });

    //   stations.sort((a, b) => {
    //     if (a.name < b.name) return -1;

    //       if (a.name > b.name) return 1;

    //       return 0;
    //   });

    //   console.log(stations.toArray());

    // }, 10000);
  }

  //#endregion

  private _stations: esri.Collection<ZZZStation> = new Collection();

  private async _getTides(date: DateTime, id: string, latitude: number, longitude: number): Promise<ZZZTide[]> {
    const predictionsResponse: ApiPredictionsResponse = await (
      await fetch(
        createURL('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter', {
          product: 'predictions',
          format: 'json',
          interval: 'hilo', // only high and low tides
          time_zone: 'lst_ldt', // station local time adjusted for DST
          units: 'english',
          datum: 'mllw', // must use 'mean lower low water' b/c most stations are subordinate
          station: id,
          begin_date: NOAADate(date.minus({ day: 1 })),
          end_date: NOAADate(date.plus({ day: 1 })),
        }),
      )
    ).json();

    const tides = predictionsResponse.predictions.map((prediction: ApiPrediction): ZZZTide => {
      const { t, v, type } = prediction;

      const tideDate = DateTime.fromSQL(t).setZone('America/Los_Angeles') as DateTime;

      const height = Number(Number(v).toFixed(2));

      return {
        date: tideDate,
        height,
        heightLabel: `${height} ft`,
        isDate: date.hasSame(tideDate, 'day'),
        isPrediction: true,
        moneyType: 'not-money',
        ...sunAndMoonPosition(tideDate, latitude, longitude),
        time: twelveHourTime(tideDate),
        type: type === 'H' ? 'high tide' : 'low tide',
      };
    });

    return tides;
  }

  private async _loadStation(stationInfo: _StationInfo): Promise<void> {
    const { id, latitude, longitude, name } = stationInfo;

    const date = this.date;

    try {
    } catch (error) {}
  }
}
