//#region styles

import '@esri/calcite-components/dist/calcite/calcite.css';
import '@arcgis/core/assets/esri/css/main.css';
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
import Point from '@arcgis/core/geometry/Point';
import { DateTime } from 'luxon';
import TidesDialog from './TidesDialog';

//#endregion

//#region constants

const CSS = {
  dialog: 'application-dialog',
  header: 'application-header',
  view: 'application-view',
};

const GET_COLOR = (property: string): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
};

const COLORS = {
  green: GET_COLOR('--calcite-color-status-success'),
  orange: GET_COLOR('--calcite-color-status-warning'),
  red: GET_COLOR('--calcite-color-status-danger'),
};

let KEY = 0;

const NOAA_DATE = (date: DateTime): string => {
  return date.toFormat('yyyyLLdd');
};

const SYMBOL_NAME = new TextSymbol({
  text: '',
  color: 'black',
  font: {
    size: 12,
  },
  haloColor: 'white',
  haloSize: 2,
  horizontalAlignment: 'left',
  xoffset: 10,
});

const SYMBOL_POINT = new SimpleMarkerSymbol({
  style: 'circle',
  color: 'black',
  size: 10,
  outline: {
    color: 'white',
    width: 1,
  },
});

const SYMBOL_TIDES = new TextSymbol({
  text: '',
  color: 'black',
  font: {
    size: 12,
  },
  haloColor: 'white',
  haloSize: 2,
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
  private alerts: esri.Collection<tsx.JSX.Element> = new Collection();

  private date = DateTime.now().setZone('America/Los_Angeles');

  private tidesDialog = new TidesDialog();

  private stations: esri.Collection<Station> = new Collection();

  private view!: esri.MapView;

  private zoomToDropDownItems: esri.Collection<tsx.JSX.Element> = new Collection();

  //#endregion

  //#region private methods

  private createGraphics(
    id: string,
    latitude: number,
    longitude: number,
    money: 0 | 1 | 2,
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

    const color = money === 0 ? COLORS.red : money === 1 ? COLORS.orange : COLORS.green;

    const attributes = { id };

    const geometry = new Point({
      latitude,
      longitude,
    });

    const graphicName = new Graphic({
      attributes,
      geometry,
      symbol: Object.assign(SYMBOL_NAME.clone(), { color, text: name }),
    });

    const graphicPoint = new Graphic({
      attributes,
      geometry,
      symbol: Object.assign(SYMBOL_POINT.clone(), { color }),
    });

    const graphicTides = new Graphic({
      attributes,
      geometry,
      symbol: Object.assign(SYMBOL_TIDES.clone(), {
        color,
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

    const color = money === 0 ? COLORS.red : money === 1 ? COLORS.orange : COLORS.green;

    graphicName.symbol = Object.assign((graphicName.symbol as esri.TextSymbol).clone(), { color });

    graphicPoint.symbol = Object.assign((graphicPoint.symbol as esri.SimpleMarkerSymbol).clone(), { color });

    graphicTides.symbol = Object.assign((graphicTides.symbol as esri.TextSymbol).clone(), {
      color,
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

      const { money, predictions } = await this.getPredictions(dateNoaa, name, id);

      Object.assign(station, { dateIso, dateNoaa, money, predictions });

      this.updateGraphics(station);

      if (tidesDialog.container.open && tidesDialog.station.id === id) {
        tidesDialog.show(station);
      }
    });
  }

  private getMoney(date: DateTime): 0 | 1 | 2 {
    const time = date.toMillis();

    const moneyStart = date.set({ hour: 11, minute: 0, second: 0, millisecond: 0 }).toMillis();

    const moneyEnd = date.set({ hour: 13, minute: 0, second: 0, millisecond: 0 }).toMillis();

    const kindaMoneyStart = date.set({ hour: 9, minute: 0, second: 0, millisecond: 0 }).toMillis();

    const kindaMoneyEnd = date.set({ hour: 15, minute: 0, second: 0, millisecond: 0 }).toMillis();

    if (time >= moneyStart && time <= moneyEnd) {
      return 2;
    } else if (time >= kindaMoneyStart && time <= kindaMoneyEnd) {
      return 1;
    } else {
      return 0;
    }
  }

  // TODO: return promise and handle error
  private async getPredictions(
    dateNoaa: string,
    name: string,
    id: number | string,
  ): Promise<{ money: 0 | 1 | 2; predictions: Prediction[] }> {
    const predictionsResponse: ApiPredictionsResponse = await (
      await fetch(
        `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&format=json&interval=hilo&time_zone=LST_LDT&units=english&datum=MLLW&station=${id}&begin_date=${dateNoaa}&end_date=${dateNoaa}`,
      )
    ).json();

    let highestHigh = {
      height: 0,
      date: DateTime.now(),
    };

    const predictions: Prediction[] = predictionsResponse.predictions.map((prediction: ApiPrediction): Prediction => {
      const { t, v, type } = prediction;

      const date = DateTime.fromSQL(t).setZone('America/Los_Angeles') as DateTime<true>;

      const height = Number(Number(v).toFixed(2));

      if (type === 'H' && height > highestHigh.height)
        highestHigh = {
          height,
          date,
        };

      return {
        height,
        time: date.toFormat('h:mm a'),
        type: type === 'H' ? 'high' : 'low',
      };
    });

    return {
      money: this.getMoney(highestHigh.date),
      predictions,
    };

    // try {
    // } catch (error) {
    //   console.log(error);

    //   this.alerts.add(
    //     <calcite-alert auto-close="" icon="exclamation-mark-circle" key={KEY++} kind="danger" open>
    //       <div slot="message">
    //         Failed to load tide predictions for {name} ({id})
    //       </div>
    //     </calcite-alert>,
    //   );
    // }
  }

  private async loadStation(stationInfo: StationInfo): Promise<void> {
    const { stationId, stationName } = stationInfo;

    try {
      const dateIso = this.date.toISODate() as string;

      const dateNoaa = NOAA_DATE(this.date);

      const stationResponse: ApiStationResponse = await (
        await fetch(`https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${stationId}.json`)
      ).json();

      const { id, lat: latitude, lng: longitude, name } = stationResponse.stations[0];

      const { money, predictions } = await this.getPredictions(dateNoaa, name, id);

      const _name = stationName || name;

      const { graphicName, graphicPoint, graphicTides } = this.createGraphics(
        id,
        latitude,
        longitude,
        money,
        _name,
        predictions,
      );

      this.stations.add({
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
      });

      this.zoomToDropDownItems.add(
        <calcite-dropdown-item key={KEY++} onclick={this.zoomTo.bind(this, id)}>
          {_name}
        </calcite-dropdown-item>,
      );
    } catch (error) {
      console.log(error);

      this.alerts.add(
        <calcite-alert auto-close="" icon="exclamation-mark-circle" key={KEY++} kind="danger" open>
          <div slot="message">Failed to load station data for {stationName || stationId}</div>
        </calcite-alert>,
      );
    }
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
          <div>Money Tides</div>
          <calcite-input-date-picker
            overlay-positioning="fixed"
            afterCreate={this.datePickerAfterCreate.bind(this)}
          ></calcite-input-date-picker>
          <calcite-dropdown width="m">
            <calcite-button icon-start="gear" slot="trigger"></calcite-button>
            <calcite-dropdown-group selection-mode="none">
              <calcite-dropdown-item>About</calcite-dropdown-item>
            </calcite-dropdown-group>
            <calcite-dropdown-group group-title="Zoom to" selection-mode="none">
              {zoomToDropDownItems.toArray()}
            </calcite-dropdown-group>
          </calcite-dropdown>
        </div>

        {/* view */}
        <div class={CSS.view} afterCreate={this.viewAfterCreate.bind(this)}></div>

        {/* dialogs */}
        <div slot="dialogs">
          <calcite-dialog afterCreate={this.tidesDialogAfterCreate.bind(this)}></calcite-dialog>
        </div>

        {/* alerts */}
        {alerts.length ? <div slot="alerts">{alerts.toArray()}</div> : null}
      </calcite-shell>
    );
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
    const view = (this.view = new MapView({
      container,
      extent: {
        spatialReference: {
          wkid: 102100,
        },
        xmin: -14063495.960129377,
        ymin: 5428315.22728483,
        xmax: -13322362.533876345,
        ymax: 5954813.478113098,
      },
      map: new Map({
        basemap: 'topo-vector',
      }),
    }));

    this.stationInfos.forEach(this.loadStation.bind(this));

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
