//#region types

import esri = __esri;

import type {
  ApiPrediction,
  ApiPredictionsResponse,
  ApiStationResponse,
  I,
  Prediction,
  Station,
  StationInfo,
} from '../typings';

//#endregion

//#region components

import '@esri/calcite-components/dist/components/calcite-alert';
import '@esri/calcite-components/dist/components/calcite-button';
import '@esri/calcite-components/dist/components/calcite-dropdown';
import '@esri/calcite-components/dist/components/calcite-dropdown-group';
import '@esri/calcite-components/dist/components/calcite-dropdown-item';
import '@esri/calcite-components/dist/components/calcite-input-date-picker';
import '@esri/calcite-components/dist/components/calcite-shell';
import '@esri/calcite-components/dist/components/calcite-shell-panel';

//#endregion

//#region modules

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
// import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { createRenderer, updateRenderer } from '@arcgis/core/smartMapping/renderers/heatmap';
import Graphic from '@arcgis/core/Graphic';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Point from '@arcgis/core/geometry/Point';
import { DateTime } from 'luxon';
import { createURL, getMoneyColors, moneyColorsHeatmap, moneyTypes, toNOAADate } from '../support';
import AboutModal from './AboutModal';
import AddStationModal from './AddStationModal';
import MapControls from './MapControls';
import TidesDialog from './TidesDialog';

import { getTimes } from 'suncalc';

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

    // this.addHandles(
    //   watch(
    //     (): number => this.stations.length,
    //     (length: number): void => {},
    //   ),
    // );
  }

  //#endregion

  //#region public properties

  @property({ type: Collection })
  public stationInfos: esri.Collection<StationInfo> = new Collection();

  //#endregion

  //#region private properties

  private aboutModal = new AboutModal();

  private addStationModal = new AddStationModal();

  private alerts: esri.Collection<tsx.JSX.Element> = new Collection();

  private date = DateTime.now().setZone('America/Los_Angeles');

  private datePicker!: HTMLCalciteInputDatePickerElement;

  private heatmapLayer!: esri.FeatureLayer;

  private tidesDialog = new TidesDialog();

  private stations: esri.Collection<Station> = new Collection();

  private view!: esri.MapView;

  private zoomToDropdownItems: esri.Collection<tsx.JSX.Element> = new Collection();

  //#endregion

  //#region private methods

  private addZoomToItem(stationInfo: StationInfo): void {
    this.zoomToDropdownItems.add(
      <calcite-dropdown-item key={KEY++} onclick={this.zoomTo.bind(this, `${stationInfo.stationId}`)}>
        {stationInfo.stationName}
      </calcite-dropdown-item>,
    );
  }

  private createGraphics(
    id: string,
    latitude: number,
    longitude: number,
    money: I['money'],
    name: string,
    predictions: Prediction[],
    noonLinearHeight: number,
    noonSinusoidalHeight: number,
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

    const { primary, secondary } = getMoneyColors(money);

    const attributes = { id };

    const geometry = new Point({
      latitude,
      longitude,
    });

    const graphicHeatmap = new Graphic({
      attributes: { id, linear: noonLinearHeight, sinusoidal: noonSinusoidalHeight },
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
        text: this.tidesSymbolText(predictions, noonLinearHeight, noonSinusoidalHeight),
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
        {
          name: 'linear',
          type: 'double',
        },
        {
          name: 'sinusoidal',
          type: 'double',
        },
      ],
      geometryType: 'point',
      objectIdField: 'OBJECTID',
      outFields: ['*'],
      source: [graphic],
      opacity: 0.6,
      visible: false,
    }));

    view.map?.add(layer);

    const renderer = (
      await createRenderer({
        layer,
        view,
        field: 'linear',
        // field: 'sinusoidal',
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

  private getLinearTideHeight(proceeding: Prediction, upcoming: Prediction, date: DateTime): number | null {
    const { date: proceedingDate, height: startHeight } = proceeding;

    const { date: upcomingDate, height: endHeight } = upcoming;

    const startTime = proceedingDate.toMillis();

    const endTime = upcomingDate.toMillis();

    const time = date.toMillis();

    // time does not fall between predictions
    if ((time < startTime && time < endTime) || (time > startTime && time > endTime)) return null;

    const height = startHeight + ((endHeight - startHeight) * (time - startTime)) / (endTime - startTime);

    return Number(height.toFixed(2));
  }

  private getNoonTideHeights(predictions: Prediction[]): { noonLinearHeight: number; noonSinusoidalHeight: number } {
    let linearTideHeight: number | nullish;

    let sinusoidalTideHeight: number | nullish;

    const noon = predictions[0].date.set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

    predictions.forEach((prediction: Prediction): void => {
      if (prediction.date.toFormat('h:mm a') === '12:00 PM')
        linearTideHeight = sinusoidalTideHeight = prediction.height;
    });

    if (!linearTideHeight || !sinusoidalTideHeight) {
      // will always find these predictions given an array of predictions for a calendar day
      let proceeding!: Prediction;

      let upcoming!: Prediction;

      predictions.forEach((prediction: Prediction): void => {
        if (prediction.date.toMillis() < noon.toMillis()) proceeding = prediction;
      });

      upcoming = predictions[predictions.indexOf(proceeding) + 1];

      linearTideHeight = this.getLinearTideHeight(proceeding, upcoming, noon);

      sinusoidalTideHeight = this.getSinusoidalTideHeight(proceeding, upcoming, noon);
    }

    return {
      noonLinearHeight: linearTideHeight || -999,
      noonSinusoidalHeight: sinusoidalTideHeight || -999,
    };
  }

  private getMoney(predictions: Prediction[]): { money: I['money']; moneyTideIndex: number } {
    // sort by height
    const _predictions: Prediction[] = predictions.toSorted((a: Prediction, b: Prediction): number => {
      return b.height - a.height;
    });

    const highestHigh: Prediction = _predictions[0];

    // may or may not have two high tides per day
    const lowestHigh: Prediction | null = _predictions[1].type === 'high' ? _predictions[1] : null;

    const highestRange = this.getTimeRange(highestHigh.date);

    const lowestRange = this.getTimeRange(lowestHigh?.date);

    const highestIndex = predictions.indexOf(highestHigh);

    const lowestIndex = lowestHigh ? predictions.indexOf(lowestHigh) : -1;

    if (highestRange === 2)
      return {
        money: moneyTypes[4],
        moneyTideIndex: highestIndex,
      };

    if (highestRange === 1)
      return {
        money: moneyTypes[3],
        moneyTideIndex: highestIndex,
      };

    if (lowestRange === 2)
      return {
        money: moneyTypes[2],
        moneyTideIndex: lowestIndex,
      };

    if (lowestRange === 1)
      return {
        money: moneyTypes[1],
        moneyTideIndex: lowestIndex,
      };

    return {
      money: moneyTypes[0],
      moneyTideIndex: -1,
    };
  }

  private async getPredictions(
    id: number | string,
    date: DateTime,
  ): Promise<{ money: I['money']; predictions: Prediction[] }> {
    const noaaDate = toNOAADate(date);

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

      const height = Number(Number(v).toFixed(2));

      const time = date.toFormat('h:mm a');

      return {
        height,
        date,
        isMoney: false,
        money: 'not-money',
        time,
        type: type === 'H' ? 'high' : 'low',
      };
    });

    const { money, moneyTideIndex } = this.getMoney(predictions);

    if (moneyTideIndex !== -1) {
      predictions[moneyTideIndex].isMoney = true;

      predictions[moneyTideIndex].money = money;
    }

    return {
      money,
      predictions,
    };
  }

  private getSinusoidalTideHeight(proceeding: Prediction, upcoming: Prediction, date: DateTime): number | null {
    const { date: proceedingDate, height: startHeight } = proceeding;

    const { date: upcomingDate, height: endHeight } = upcoming;

    const startTime = proceedingDate.toMillis();

    const endTime = upcomingDate.toMillis();

    const time = date.toMillis();

    // time does not fall between predictions
    if ((time < startTime && time < endTime) || (time > startTime && time > endTime)) return null;

    const duration = endTime - startTime;

    const mean = (startHeight + endHeight) / 2;

    const amplitude = Math.abs(endHeight - startHeight) / 2;

    const phase = (Math.PI * (time - startTime)) / duration;

    // low to high = sin
    // high to low = -sin
    const direction = endHeight > startHeight ? 1 : -1;

    const height = mean + amplitude * direction * Math.sin(phase);

    return Number(height.toFixed(2));
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

  private async loadStation(stationInfo: StationInfo): Promise<Station | void> {
    const { stationId, stationName } = stationInfo;

    const date = this.date;

    try {
      const stationResponse: ApiStationResponse = await (
        await fetch(`https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${stationId}.json`)
      ).json();

      const { id, lat: latitude, lng: longitude, name } = stationResponse.stations[0];

      const _name = stationName || name;

      const { money, predictions } = await this.getPredictions(id, date);

      const { noonLinearHeight, noonSinusoidalHeight } = this.getNoonTideHeights(predictions);

      const suntimes = getTimes(date.toJSDate(), latitude, longitude);

      console.log(suntimes);

      const { graphicHeatmap, graphicName, graphicPoint, graphicTides } = this.createGraphics(
        id,
        latitude,
        longitude,
        money,
        _name,
        predictions,
        noonLinearHeight,
        noonSinusoidalHeight,
      );

      const station = {
        id,
        date,
        latitude,
        longitude,
        name: _name,
        money,
        predictions,
        graphicHeatmap,
        graphicName,
        graphicPoint,
        graphicTides,
        noonLinearHeight,
        noonSinusoidalHeight,
      };

      this.stations.add(station);

      // this.heatmapLayer.applyEdits({
      //   addFeatures: [
      //     new Graphic({
      //       attributes: {

      //       },
      //       geometry: {
      //         latitude,
      //         longitude,
      //         type: 'point',
      //       },
      //     }),
      //   ],
      // });

      return station;
    } catch (error) {
      console.log(error);

      this.alerts.add(
        <calcite-alert auto-close="" icon="exclamation-mark-circle" key={KEY++} kind="danger" open>
          <div slot="message">Failed to load station data for {stationName}</div>
        </calcite-alert>,
      );
    }
  }

  private tidesSymbolText(predictions: Prediction[], noonLinearHeight: number, noonSinusoidalHeight: number): string {
    return [
      ...predictions.map((prediction: Prediction): string => {
        const { height, time, type } = prediction;
        return `${time} ${type} ${height} ft`;
      }),
      'Noon height:',
      `Linear ${noonLinearHeight} ft`,
      `Sinusoidal ${noonSinusoidalHeight} ft`,
    ].join('\n');
  }

  private updateSymbols(station: Station): void {
    const {
      money,
      predictions,
      graphicHeatmap,
      graphicName,
      graphicPoint,
      graphicTides,
      noonLinearHeight,
      noonSinusoidalHeight,
    } = station;

    const { primary, secondary } = getMoneyColors(money);

    graphicName.symbol = Object.assign((graphicName.symbol as esri.TextSymbol).clone(), {
      color: primary,
      haloColor: secondary,
    });

    graphicPoint.symbol = Object.assign((graphicPoint.symbol as esri.SimpleMarkerSymbol).clone(), {
      color: primary,
      outline: { color: secondary, width: SYMBOL_POINT.outline.width },
    });

    graphicTides.symbol = Object.assign((graphicTides.symbol as esri.TextSymbol).clone(), {
      color: primary,
      haloColor: secondary,
      text: this.tidesSymbolText(predictions, noonLinearHeight, noonSinusoidalHeight),
    });

    Object.assign(graphicHeatmap.attributes, { linear: noonLinearHeight, sinusoidal: noonSinusoidalHeight });

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
    const { tidesDialog } = this;

    const date = (this.date = DateTime.fromISO(
      (event.target as HTMLCalciteInputDatePickerElement).value as string,
    ).setZone('America/Los_Angeles'));

    this.stations.forEach(async (station: Station): Promise<void> => {
      const { id } = station;

      const { money, predictions } = await this.getPredictions(id, date);

      const { noonLinearHeight, noonSinusoidalHeight } = this.getNoonTideHeights(predictions);

      Object.assign(station, { date, money, predictions, noonLinearHeight, noonSinusoidalHeight });

      this.updateSymbols(station);

      if (tidesDialog.container.open && tidesDialog.station.id === id) {
        tidesDialog.show(station);
      }
    });
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

    if (!station) return;

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
            <calcite-button icon-start="chevron-left" onclick={this.dateButtonClickEvent.bind(this)}></calcite-button>
            <calcite-input-date-picker
              overlay-positioning="fixed"
              afterCreate={this.datePickerAfterCreate.bind(this)}
            ></calcite-input-date-picker>
            <calcite-button icon-start="chevron-right" onclick={this.dateButtonClickEvent.bind(this)}></calcite-button>
          </div>

          <div class={CSS.headerButtons}>
            <calcite-dropdown width="m">
              <calcite-button icon-start="zoom-to-object" slot="trigger"></calcite-button>
              <calcite-dropdown-group group-title="Zoom to" selection-mode="none">
                {zoomToDropdownItems.toArray()}
              </calcite-dropdown-group>
            </calcite-dropdown>

            <calcite-dropdown width="m">
              <calcite-button icon-start="gear" slot="trigger"></calcite-button>
              <calcite-dropdown-group selection-mode="none">
                <calcite-dropdown-item
                  onclick={(): void => {
                    this.aboutModal.open();
                  }}
                >
                  About
                </calcite-dropdown-item>
                <calcite-dropdown-item
                  onclick={(): void => {
                    this.addStationModal.open();
                  }}
                >
                  Add Station
                </calcite-dropdown-item>
              </calcite-dropdown-group>
            </calcite-dropdown>
          </div>
        </div>

        {/* view */}
        <div class={CSS.view} afterCreate={this.viewAfterCreate.bind(this)}></div>

        {/* dialogs */}
        <div slot="dialogs">
          <calcite-dialog afterCreate={this.tidesDialogAfterCreate.bind(this)}></calcite-dialog>
          <calcite-dialog afterCreate={this.aboutModalAfterCreate.bind(this)}></calcite-dialog>
          <calcite-dialog afterCreate={this.addStationModalAfterCreate.bind(this)}></calcite-dialog>
        </div>

        {/* alerts */}
        {alerts.length ? <div slot="alerts">{alerts.toArray()}</div> : null}
      </calcite-shell>
    );
  }

  private aboutModalAfterCreate(dialog: HTMLCalciteDialogElement): void {
    this.aboutModal.container = dialog;
  }

  private addStationModalAfterCreate(dialog: HTMLCalciteDialogElement): void {
    this.addStationModal.container = dialog;

    this.addStationModal.on('add-station', async (stationInfo: StationInfo): Promise<void> => {
      const station = await this.loadStation(stationInfo);

      if (!station) return;

      this.addZoomToItem({
        stationId: station.id,
        stationName: station.name,
      });

      this.zoomTo(station.id);
    });
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
        xmin: -13955940,
        ymin: 5182285,
        xmax: -13655084,
        ymax: 5708171,
      },
      map: new Map({
        basemap: 'topo-vector',
        // layers: [
        //   new MapImageLayer({
        //     url: 'https://mapservices.weather.noaa.gov/static/rest/services/NOS_Observations/CO_OPS_Products/MapServer',
        //     visible: false,
        //   }),
        //   new MapImageLayer({
        //     url: 'https://mapservices.weather.noaa.gov/static/rest/services/NOS_Observations/CO_OPS_Stations/MapServer',
        //     visible: false,
        //   }),
        //   new MapImageLayer({
        //     url: 'https://mapservices.weather.noaa.gov/static/rest/services/NOS_Observations/CO_OPS_OFS_Models/MapServer',
        //     visible: false,
        //   }),
        // ],
      }),
    }));

    view.ui.remove(['attribution', 'zoom']);

    view.ui.add(new MapControls({ view }), 'top-left');

    stationInfos.forEach(this.loadStation.bind(this));

    stationInfos.forEach(this.addZoomToItem.bind(this));

    // stationInfos.forEach((stationInfo: StationInfo, index: number): void => {});

    this.addHandles(view.on('click', this.viewClickEvent.bind(this)));

    const loader = document.body.querySelector('calcite-loader') as HTMLCalciteLoaderElement;

    setTimeout((): void => {
      loader.style.opacity = '0';
    }, 2000);

    setTimeout((): void => {
      document.body.removeChild(loader);
    }, 3000);
  }

  //#endregion
}
