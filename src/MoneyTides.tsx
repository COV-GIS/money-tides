//#region styles

import '@esri/calcite-components/dist/calcite/calcite.css';
import '@arcgis/core/assets/esri/css/main.css';
import './AboutModal.scss';
import './MapControls.scss';
import './MoneyTides.scss';
import './TidesDialog.scss';

//#endregion

//#region types

import esri = __esri;

import type {
  ApiPrediction,
  ApiPredictionsResponse,
  ApiStationResponse,
  Prediction,
  Station,
  StationInfo,
} from './typings';

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
import Graphic from '@arcgis/core/Graphic';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import { byName } from '@arcgis/core/smartMapping/symbology/support/colorRamps';
import Color from '@arcgis/core/Color';
import Point from '@arcgis/core/geometry/Point';
import { DateTime } from 'luxon';
import AboutModal from './AboutModal';
import AddStationModal from './AddStationModal';
import MapControls from './MapControls';
import TidesDialog from './TidesDialog';

//#endregion

//#region constants

const CSS = {
  dialog: 'money-tides_dialog',
  header: 'money-tides_header',
  headerButtons: 'money-tides_header--buttons',
  headerTitle: 'money-tides_header--title',
  view: 'money-tides_view',
};

let KEY = 0;

export const NOAA_DATE = (date: DateTime): string => {
  return date.toFormat('yyyyLLdd');
};

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

  private colors!: esri.supportColorRampsColorRamp;

  private date = DateTime.now().setZone('America/Los_Angeles');

  private tidesDialog = new TidesDialog();

  private stations: esri.Collection<Station> = new Collection();

  private view!: esri.MapView;

  private zoomToDropDownItems: esri.Collection<tsx.JSX.Element> = new Collection();

  //#endregion

  //#region private methods

  private addZoomToItem(stationInfo: StationInfo): void {
    this.zoomToDropDownItems.add(
      <calcite-dropdown-item key={KEY++} onclick={this.zoomTo.bind(this, `${stationInfo.stationId}`)}>
        {stationInfo.stationName}
      </calcite-dropdown-item>,
    );
  }

  private createGraphics(
    id: string,
    latitude: number,
    longitude: number,
    money: Station['money'],
    name: string,
    predictions: Prediction[],
  ): {
    graphicName: esri.Graphic;
    graphicPoint: esri.Graphic;
    graphicTides: esri.Graphic;
  } {
    const {
      view,
      view: { graphics },
    } = this;

    const { color, haloColor } = this.moneyColors(money);

    const attributes = { id };

    const geometry = new Point({
      latitude,
      longitude,
    });

    const graphicName = new Graphic({
      attributes,
      geometry,
      symbol: Object.assign(SYMBOL_NAME.clone(), { color, haloColor, text: name }),
    });

    const graphicPoint = new Graphic({
      attributes,
      geometry,
      symbol: Object.assign(SYMBOL_POINT.clone(), {
        color,
        outline: { color: haloColor, width: SYMBOL_POINT.outline.width },
      }),
    });

    const graphicTides = new Graphic({
      attributes,
      geometry,
      symbol: Object.assign(SYMBOL_TIDES.clone(), {
        color,
        haloColor,
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

    return { graphicName, graphicPoint, graphicTides };
  }

  private updateGraphics(station: Station): void {
    const { money, predictions, graphicName, graphicPoint, graphicTides } = station;

    const { color, haloColor } = this.moneyColors(money);

    graphicName.symbol = Object.assign((graphicName.symbol as esri.TextSymbol).clone(), { color, haloColor });

    graphicPoint.symbol = Object.assign((graphicPoint.symbol as esri.SimpleMarkerSymbol).clone(), {
      color,
      outline: { color: haloColor, width: SYMBOL_POINT.outline.width },
    });

    graphicTides.symbol = Object.assign((graphicTides.symbol as esri.TextSymbol).clone(), {
      color,
      haloColor,
      text: this.tidesSymbolText(predictions),
    });
  }

  private dateChange(event: Event): void {
    const { tidesDialog } = this;

    const date = (this.date = DateTime.fromISO(
      (event.target as HTMLCalciteInputDatePickerElement).value as string,
    ).setZone('America/Los_Angeles'));

    const dateIso = date.toISODate() as string;

    const dateNoaa = NOAA_DATE(date);

    this.stations.forEach(async (station: Station): Promise<void> => {
      const { id, name } = station;

      const { money, predictions } = await this.getPredictions(dateNoaa, id);

      Object.assign(station, { dateIso, dateNoaa, money, predictions });

      this.updateGraphics(station);

      if (tidesDialog.container.open && tidesDialog.station.id === id) {
        tidesDialog.show(station);
      }
    });
  }

  private getMoney(predictions: Prediction[]): Station['money'] {
    // sort by height
    const _predictions: Prediction[] = predictions.toSorted((a: Prediction, b: Prediction): number => {
      return b.height - a.height;
    });

    const highestHigh: Prediction = _predictions[0];

    // may or may not have two high tides per day
    const lowestHigh: Prediction | null = _predictions[1].type === 'high' ? _predictions[1] : null;

    const highestIsMoney = this.isMoney(highestHigh.date);

    const lowestIsMoney = this.isMoney(lowestHigh?.date);

    if (highestIsMoney === 'yes') return 4;

    if (highestIsMoney === 'kinda') return 3;

    if (lowestIsMoney === 'yes') return 2;

    if (lowestIsMoney === 'kinda') return 1;

    return 0;
  }

  // only invoke within try/catch statement
  private async getPredictions(
    dateNoaa: string,
    id: number | string,
  ): Promise<{ money: Station['money']; predictions: Prediction[] }> {
    const predictionsResponse: ApiPredictionsResponse = await (
      await fetch(
        `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&format=json&interval=hilo&time_zone=LST_LDT&units=english&datum=MLLW&station=${id}&begin_date=${dateNoaa}&end_date=${dateNoaa}`,
      )
    ).json();

    const predictions: Prediction[] = predictionsResponse.predictions.map((prediction: ApiPrediction): Prediction => {
      const { t, v, type } = prediction;

      const date = DateTime.fromSQL(t).setZone('America/Los_Angeles') as DateTime<true>;

      const height = Number(Number(v).toFixed(2));

      return {
        height,
        date,
        // money: this.isMoney(date),
        time: date.toFormat('h:mm a'),
        type: type === 'H' ? 'high' : 'low',
      };
    });

    return {
      money: this.getMoney(predictions),
      predictions,
    };
  }

  private isMoney(date?: DateTime): 'no' | 'kinda' | 'yes' {
    if (!date) return 'no';

    const time = date.toMillis();

    if (
      time >= date.set({ hour: 11, minute: 0, second: 0, millisecond: 0 }).toMillis() &&
      time <= date.set({ hour: 13, minute: 0, second: 0, millisecond: 0 }).toMillis()
    )
      return 'yes';

    if (
      time >= date.set({ hour: 10, minute: 0, second: 0, millisecond: 0 }).toMillis() &&
      time <= date.set({ hour: 14, minute: 0, second: 0, millisecond: 0 }).toMillis()
    )
      return 'kinda';

    return 'no';
  }

  private async loadStation(stationInfo: StationInfo): Promise<Station | void> {
    const { stationId, stationName } = stationInfo;

    try {
      const dateIso = this.date.toISODate() as string;

      const dateNoaa = NOAA_DATE(this.date);

      const stationResponse: ApiStationResponse = await (
        await fetch(`https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${stationId}.json`)
      ).json();

      const { id, lat: latitude, lng: longitude, name } = stationResponse.stations[0];

      const { money, predictions } = await this.getPredictions(dateNoaa, id);

      const _name = stationName || name;

      const { graphicName, graphicPoint, graphicTides } = this.createGraphics(
        id,
        latitude,
        longitude,
        money,
        _name,
        predictions,
      );

      const station = {
        id,
        dateIso,
        dateNoaa,
        latitude,
        longitude,
        name: _name,
        money,
        predictions,
        graphicName,
        graphicPoint,
        graphicTides,
      };

      this.stations.add(station);

      return station;
    } catch (error) {
      console.log(error);

      this.alerts.add(
        <calcite-alert auto-close="" icon="exclamation-mark-circle" key={KEY++} kind="danger" open>
          <div slot="message">Failed to load station data for {stationName || stationId}</div>
        </calcite-alert>,
      );
    }
  }

  private moneyColors(money: Station['money']): { color: esri.Color; haloColor: esri.Color } {
    const color = this.colors.colors[money] as esri.Color & { isBright: boolean };

    return {
      color,
      haloColor: new Color(color.isBright ? [0, 0, 0] : [255, 255, 255]),
    };
  }

  private tidesSymbolText(predictions: Prediction[]): string {
    return predictions
      .map((prediction: Prediction): string => {
        const { height, time, type } = prediction;
        return `${time} ${type} ${height} ft`;
      })
      .join('\n');
  }

  private async viewClick(event: esri.ViewClickEvent): Promise<void> {
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

  private zoomTo(id: string): void {
    const { view } = this;

    const station = this.stations.find((station: Station): boolean => {
      return station.id === id;
    });

    if (!station) return;

    view.goTo(station.graphicPoint);

    view.scale = 24000;

    this.tidesDialog.show(station);
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    const { alerts, zoomToDropDownItems } = this;

    return (
      <calcite-shell>
        {/* header */}
        <div class={CSS.header} slot="header">
          <div class={CSS.headerTitle}>Money Tides</div>

          <calcite-input-date-picker
            overlay-positioning="fixed"
            afterCreate={this.datePickerAfterCreate.bind(this)}
          ></calcite-input-date-picker>

          <div class={CSS.headerButtons}>
            <calcite-dropdown width="m">
              <calcite-button icon-start="zoom-to-object" slot="trigger"></calcite-button>
              <calcite-dropdown-group group-title="Zoom to" selection-mode="none">
                {zoomToDropDownItems.toArray()}
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

    datePicker.min = today;

    datePicker.addEventListener('calciteInputDatePickerChange', this.dateChange.bind(this));
  }

  private tidesDialogAfterCreate(dialog: HTMLCalciteDialogElement): void {
    this.tidesDialog.container = dialog;
  }

  private async viewAfterCreate(container: HTMLDivElement): Promise<void> {
    this.colors = byName('Red and Green 9') as esri.supportColorRampsColorRamp;

    const view = (this.view = new MapView({
      container,
      constraints: {
        rotationEnabled: false,
      },
      extent: {
        spatialReference: {
          wkid: 102100,
        },
        xmin: -13955940.166008195,
        ymin: 5182285.156662469,
        xmax: -13655084.022677755,
        ymax: 5708171.911264456,
      },
      map: new Map({
        basemap: 'topo-vector',
      }),
    }));

    view.ui.remove(['attribution', 'zoom']);

    view.ui.add(new MapControls({ view }), 'top-left');

    this.stationInfos.forEach(this.loadStation.bind(this));

    this.stationInfos.forEach(this.addZoomToItem.bind(this));

    this.addHandles(view.on('click', this.viewClick.bind(this)));

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
