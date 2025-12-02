import esri = __esri;

export interface Location {
  station: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface _Location extends Location {
  predictions?: Predictions;
  /**
   * `0` - no money
   * `1` - kinda money
   * `2` - absolutely money
   */
  money?: 0 | 1 | 2;
}

interface Prediction {
  // api
  t: string;
  v: string;
  type: 'H' | 'L';
  // app
  time: string;
}

interface Predictions {
  predictions: Prediction[];
}

import '@esri/calcite-components/dist/components/calcite-alert';
import '@esri/calcite-components/dist/components/calcite-dialog';
import '@esri/calcite-components/dist/components/calcite-input-date-picker';
import '@esri/calcite-components/dist/components/calcite-loader';
import '@esri/calcite-components/dist/components/calcite-panel';
import '@esri/calcite-components/dist/components/calcite-shell';
import '@esri/calcite-components/dist/components/calcite-shell-panel';
import '@esri/calcite-components/dist/components/calcite-table';
import '@esri/calcite-components/dist/components/calcite-table-row';

import { watch } from '@arcgis/core/core/reactiveUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';

import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Point from '@arcgis/core/geometry/Point';

import { DateTime } from 'luxon';

const CSS = {
  header: 'application-header',
  view: 'application-view',
};

const GET_COLOR = (property: string): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
};

export const COLORS = {
  green: GET_COLOR('--calcite-color-status-success'),
  orange: GET_COLOR('--calcite-color-status-warning'),
  red: GET_COLOR('--calcite-color-status-danger'),
};

const GRAPHICS_HANDLES = 'graphics-handles';

// https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=9437908&units=standard&bdate=20251208&edate=20251208&timezone=LST/LDT&clock=12hour&datum=MLLW&interval=hilo&action=dailychart
// const STATION_PREDICTION_URL = 'https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id={STATION}';

const NOAA_DATE = (date: DateTime): string => {
  return date.toFormat('yyyyLLdd');
};

@subclass('Application')
export default class Application extends Widget {
  _container = document.createElement('calcite-shell');

  get container(): HTMLCalciteShellElement {
    return this._container;
  }

  set container(value: HTMLCalciteShellElement) {
    this._container = value;
  }

  constructor(properties: esri.WidgetProperties & { locations: esri.Collection<Location> | Location[] }) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);
  }

  alerts: esri.Collection<tsx.JSX.Element> = new Collection();

  date = DateTime.now().setZone('America/Los_Angeles');

  dialog = new Dialog();

  @property({ type: Collection })
  locations: esri.Collection<_Location> = new Collection();

  graphics = new GraphicsLayer();

  graphicsView!: esri.GraphicsLayerView;

  view!: esri.MapView;

  addGraphics(location: _Location): void {
    const { view } = this;

    const { station, name, latitude, longitude, predictions, money } = location;

    const color = money === 0 ? COLORS.red : money === 1 ? COLORS.orange : COLORS.green;

    const geometry = new Point({
      latitude,
      longitude,
    });

    const attributes = { station };

    const tides = new Graphic({
      attributes,
      geometry,
      symbol: new TextSymbol({
        text: predictions?.predictions
          .map((prediction: Prediction): string => {
            const { v, type, time } = prediction;
            return `${time} - ${type === 'H' ? 'High' : 'Low'} ${Number(v).toFixed(2)} ft`;
          })
          .join('\n'),
        color,
        font: {
          size: 10,
        },
        haloColor: 'white',
        haloSize: 2,
        horizontalAlignment: 'left',
        xoffset: 10,
        yoffset: -12,
      }),
      visible: view.scale < 240000,
    });

    this.addHandles(
      watch(
        (): number => view.scale,
        (): void => {
          tides.visible = view.scale < 240000;
        },
      ),
      GRAPHICS_HANDLES,
    );

    this.graphics.addMany([
      new Graphic({
        attributes,
        geometry,
        symbol: new SimpleMarkerSymbol({
          style: money === 0 ? 'square' : 'circle',
          color,
          size: 8,
          outline: {
            color: 'white',
            width: 2,
          },
        }),
      }),
      new Graphic({
        attributes,
        geometry,
        symbol: new TextSymbol({
          text: `${name}`,
          color,
          font: {
            size: 10,
          },
          haloColor: 'white',
          haloSize: 2,
          horizontalAlignment: 'left',
          xoffset: 10,
        }),
      }),
      tides,
    ]);
  }

  dateChange(event: Event): void {
    this.dialog.close(); // TODO: check if dialog is open and rerender with new location and date data

    this.date = DateTime.fromISO((event.target as HTMLCalciteInputDatePickerElement).value as string);

    this.graphics.removeAll();

    this.removeHandles(GRAPHICS_HANDLES);

    this.locations.forEach(this.locationPredictions.bind(this));
  }

  datePickerAfterCreate(datePicker: HTMLCalciteInputDatePickerElement): void {
    const today = this.date.toISODate() as string;

    datePicker.value = today;

    datePicker.min = today;

    datePicker.addEventListener('calciteInputDatePickerChange', this.dateChange.bind(this));
  }

  async locationPredictions(location: _Location): Promise<void> {
    try {
      const date = NOAA_DATE(this.date);

      const predictions: Predictions = await (
        await fetch(
          `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&format=json&interval=hilo&time_zone=LST_LDT&units=english&datum=MLLW&station=${location.station}&begin_date=${date}&end_date=${date}`,
        )
      ).json();

      let highestHigh = {
        height: 0,
        date: DateTime.now(),
      };

      predictions.predictions.forEach((prediction: Prediction): void => {
        const { t, v, type } = prediction;

        const date = DateTime.fromSQL(t).setZone('America/Los_Angeles') as DateTime<true>;

        const height = Number(v);

        prediction.time = date.toFormat('h:mm a');

        if (type === 'H' && height > highestHigh.height)
          highestHigh = {
            height,
            date,
          };
      });

      location.money = this.isMoney(highestHigh.date);

      location.predictions = predictions;

      this.addGraphics(location);
    } catch (error) {
      console.log(error);

      this.alerts.add(
        <calcite-alert icon="exclamation-mark-circle" kind="danger" open>
          <div slot="message">Failed to load tides for {location.name}</div>
        </calcite-alert>,
      );
    }
  }

  isMoney(date: DateTime): 0 | 1 | 2 {
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

  async viewAfterCreate(container: HTMLDivElement): Promise<void> {
    const { graphics } = this;

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
        layers: [graphics],
      }),
    }));

    this.locations.forEach(this.locationPredictions.bind(this));

    this.graphicsView = await view.whenLayerView(graphics);

    this.addHandles(view.on('click', this.viewClick.bind(this)));

    const loader = document.body.querySelector('calcite-loader') as HTMLCalciteLoaderElement;

    setTimeout((): void => {
      loader.style.opacity = '0';

      setTimeout((): void => {
        document.body.removeChild(loader);
      }, 2500);
    }, 2000);
  }

  async viewClick(event: esri.ViewClickEvent): Promise<void> {
    event.stopPropagation();

    const result = (await this.view.hitTest(event, { include: [this.graphics] })).results[0];

    if (!result || result.type !== 'graphic') {
      this.dialog.close();

      return;
    }

    const location = this.locations.find((location: _Location): boolean => {
      return location.station === result.graphic.attributes.station;
    });

    if (!location) return;

    console.log(location);

    this.dialog.show(location, this.date);
  }

  render(): tsx.JSX.Element {
    const { alerts } = this;

    return (
      <calcite-shell>
        <div class={CSS.header} slot="header">
          <div>Money Tides</div>
          <calcite-input-date-picker
            overlay-positioning="fixed"
            afterCreate={this.datePickerAfterCreate.bind(this)}
          ></calcite-input-date-picker>
        </div>

        <div class={CSS.view} afterCreate={this.viewAfterCreate.bind(this)}></div>

        {alerts.length ? <div slot="alerts">{alerts.toArray()}</div> : null}
      </calcite-shell>
    );
  }
}

@subclass('Dialog')
class Dialog extends Widget {
  private _container = document.createElement('calcite-dialog');

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteDialogElement) {
    this._container = value;
  }

  constructor(properties?: esri.WidgetProperties) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);
  }

  // @property()
  date!: DateTime;

  // @property()
  location!: _Location;

  close(): void {
    this.container.open = false;
  }

  show(location: _Location, date: DateTime): void {
    this.location = location;

    this.date = date;

    this.renderNow();

    this.container.open = true;
  }

  viewStation(): void {
    const date = NOAA_DATE(this.date);

    window.open(
      `https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=${this.location.station}&units=standard&bdate=${date}&edate=${date}&timezone=LST/LDT&clock=12hour&datum=MLLW&interval=hilo&action=dailychart`,
      '_blank',
    );
  }

  render(): tsx.JSX.Element {
    const { date, location } = this;

    if (!date || !location) return <calcite-dialog></calcite-dialog>;

    const { name, money } = location;

    const heading = `${name} - ${date.toLocaleString(DateTime.DATE_FULL)}`;

    const kind = money === 0 ? 'danger' : money === 1 ? 'warning' : 'success';

    return (
      <calcite-dialog heading={heading} kind={kind} placement="bottom-start" scale="s" width="s">
        {this.renderTidesTable(location)}
        <calcite-button scale="s" slot="footer-end" onclick={this.viewStation.bind(this)}>
          View Station Page
        </calcite-button>
      </calcite-dialog>
    );
  }

  renderTidesTable(location: _Location): tsx.JSX.Element {
    return (
      <calcite-table scale="s" striped>
        {location.predictions?.predictions.map((prediction: Prediction): tsx.JSX.Element => {
          const { v, type, time } = prediction;

          return (
            <calcite-table-row>
              <calcite-table-cell>{time}</calcite-table-cell>
              <calcite-table-cell>{type === 'H' ? 'High' : 'Low'}</calcite-table-cell>
              <calcite-table-cell>{Number(v).toFixed(2)} ft</calcite-table-cell>
            </calcite-table-row>
          );
        })}
      </calcite-table>
    );
  }
}
