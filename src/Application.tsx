import esri = __esri;

import '@esri/calcite-components/dist/components/calcite-input-date-picker';
import '@esri/calcite-components/dist/components/calcite-loader';
import '@esri/calcite-components/dist/components/calcite-panel';
import '@esri/calcite-components/dist/components/calcite-shell';
import '@esri/calcite-components/dist/components/calcite-shell-panel';

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';

import { DateTime } from 'luxon';

const CSS = {
  datePicker: 'application-date-picker',
  header: 'application-header',
  loader: 'application-loader',
  panel: 'application-panel',
  view: 'application-view',
};

// const LOCATIONS = {
//   type: 'FeatureCollection',
//   features: [
//     {
//       type: 'Feature',
//       geometry: {
//         type: 'Point',
//         coordinates: [-123.929533, 45.686923],
//       },
//       properties: {
//         money: 'no',
//         name: 'Nehalem Bay',
//         station: 9437908,
//       },
//     },
//     {
//       type: 'Feature',
//       geometry: {
//         type: 'Point',
//         coordinates: [-124.02262, 44.922025],
//       },
//       properties: {
//         money: 'no',
//         name: 'Siletz Bay',
//         station: 9436101,
//       },
//     },
//   ],
// };

const LOCATIONS = {
  9437908: {
    name: 'Nehalem Bay',
    latitude: 45.686923,
    longitude: -123.929533,
  },
  9436101: {
    name: 'Siletz Bay',
    latitude: 44.922025,
    longitude: -124.02262,
  },
};

const STATION_PREDICTION_URL = 'https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id={STATION}';

@subclass('Application')
export default class Application extends Widget {
  private _container = document.createElement('calcite-shell');

  get container(): HTMLCalciteShellElement {
    return this._container;
  }

  set container(value: HTMLCalciteShellElement) {
    this._container = value;
  }

  constructor(properties?: esri.WidgetProperties) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);

    // setInterval(this._setTime.bind(this), 1000);

    // setTimeout((): void => {
    //   console.log(this.view?.extent.toJSON());
    // }, 15000);
  }

  override async postInitialize(): Promise<void> {
    const x = await (
      await fetch(
        'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&format=json&interval=hilo&time_zone=LST_LDT&units=english&datum=MLLW&station=9437908&begin_date=20251125&end_date=20251125',
      )
    ).json();

    console.log(x);

    // const y = await (await fetch(
    //   'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&format=json&interval=hilo&time_zone=LST_LDT&units=english&datum=MLLW&station=9437908&begin_date=20251125&end_date=20251125',
    // )).json();

    // console.log(y);
  }

  protected view?: esri.MapView;

  private _date = DateTime.now().setZone('America/Los_Angeles');

  @property()
  private _datePicker!: HTMLCalciteInputDatePickerElement;

  private _graphics = new GraphicsLayer();

  @property()
  private _loaded = false;

  @property()
  private _time = DateTime.now().setZone('America/Los_Angeles');

  private _setTime(): void {
    this._time = DateTime.now().setZone('America/Los_Angeles');
  }

  override render(): tsx.JSX.Element {
    return this._loaded ? (
      <calcite-shell>
        <calcite-loader class={CSS.loader} label="Loading money tides" text="Loading money tides"></calcite-loader>
      </calcite-shell>
    ) : (
      <calcite-shell>
        <div class={CSS.header} slot="header">
          <div>Money Tides</div>
        </div>

        <div class={CSS.view} afterCreate={this._viewAfterCreate.bind(this)}></div>

        <calcite-shell-panel slot="panel-end">
          <calcite-panel class={CSS.panel}>
            <div class={CSS.datePicker}>
              <calcite-button appearance="transparent" icon-start="chevron-left"></calcite-button>
              <calcite-input-date-picker
                afterCreate={this._datePickerAfterCreate.bind(this)}
              ></calcite-input-date-picker>
              <calcite-button appearance="transparent" icon-start="chevron-right"></calcite-button>
            </div>
          </calcite-panel>
        </calcite-shell-panel>
      </calcite-shell>
    );
  }

  private _datePickerAfterCreate(datePicker: HTMLCalciteInputDatePickerElement): void {
    datePicker.value = `${this._date.toISODate()}`;

    this._datePicker = datePicker;
  }

  private _viewAfterCreate(container: HTMLDivElement): void {
    this.view = new MapView({
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
        layers: [this._graphics],
      }),
    });
  }
}
