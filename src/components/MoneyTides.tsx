//#region types

import esri = __esri;

import type { __MT as MT } from '../interfaces';

import type {
  ApiPrediction,
  ApiPredictionsResponse,
  // MoneyType,
  // StationInfo,
  // _StationInfo,
  // ZoomToItem,
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
import { sunAndMoon, sunAndMoonPosition } from '../utils/sunAndMoonUtils';
import { tideHeight } from '../utils/tideUtils';
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

  constructor(
    properties?: esri.WidgetProperties & { stationInfos: MT.StationInfo[] | esri.Collection<MT.StationInfo> },
  ) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);

    const { zoomToDropdownItems } = this;

    this.addHandles(
      zoomToDropdownItems.on('after-add', (): void => {
        zoomToDropdownItems.sort((a: MT.ZoomToItem, b: MT.ZoomToItem): number => {
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
  public stationInfos: esri.Collection<MT._StationInfo> = new Collection();

  //#endregion

  //#region private properties

  private aboutModal = new AboutModal();

  private alerts: esri.Collection<tsx.JSX.Element> = new Collection();

  private date = setNoon(DateTime.now().setZone('America/Los_Angeles'));

  private datePicker!: HTMLCalciteInputDatePickerElement;

  private heatmapLayer!: esri.FeatureLayer;

  private tidesDialog = new TidesDialog();

  private stations: esri.Collection<MT.Station> = new Collection();

  private view!: esri.MapView;

  private zoomToDropdownItems: esri.Collection<MT.ZoomToItem> = new Collection();

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

            const station = this.stations.find((station: MT.Station): boolean => {
              return station.id === id;
            });

            if (!station) return;

            view.goTo(station.graphics.marker);

            view.scale = 60000;

            // TODO
            // this.tidesDialog.open(station);
          }}
        >
          {name}
        </calcite-dropdown-item>
      ),
    });
  }

  private createGraphics(params: {
    id: string;
    latitude: number;
    longitude: number;
    money: MT.MoneyType;
    name: string;
    tides: MT.Tide[];
  }): MT.StationGraphics {
    const {
      view,
      view: { graphics },
    } = this;

    const { id, latitude, longitude, money, name, tides } = params;

    const { primary, secondary } = moneyTypeColors(money);

    const attributes = { id };

    const geometry = new Point({
      latitude,
      longitude,
    });

    const heatmapGraphic = new Graphic({
      attributes: { id, height: 0 },
      geometry,
    });

    if (!this.heatmapLayer) {
      this.createLayer(heatmapGraphic);
    } else {
      this.heatmapLayer.applyEdits({
        addFeatures: [heatmapGraphic],
      });
    }

    const stationGraphic = new Graphic({
      attributes,
      geometry,
      symbol: Object.assign(SYMBOL_NAME.clone(), { color: primary, haloColor: secondary, text: name }),
    });

    const markerGraphic = new Graphic({
      attributes,
      geometry,
      symbol: Object.assign(SYMBOL_POINT.clone(), {
        color: primary,
        outline: { color: secondary, width: SYMBOL_POINT.outline.width },
      }),
    });

    const tidesGraphic = new Graphic({
      attributes,
      geometry,
      symbol: Object.assign(SYMBOL_TIDES.clone(), {
        color: primary,
        haloColor: secondary,
        text: this.tidesSymbolText(tides),
      }),
      visible: view.scale < 240000,
    });

    this.addHandles(
      watch(
        (): number => view.scale,
        (): void => {
          tidesGraphic.visible = view.scale < 240000;
        },
      ),
    );

    graphics.addMany([markerGraphic, stationGraphic, tidesGraphic]);

    return { heatmap: heatmapGraphic, marker: markerGraphic, station: stationGraphic, tides: tidesGraphic };
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

  private async getTides(params: MT.GetTidesParameters): Promise<{ money: MT.MoneyType; tides: MT.Tide[] }> {
    const { date, id, latitude, longitude, tideEvents } = params;

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

    const tides = predictionsResponse.predictions.map((prediction: ApiPrediction): MT.Tide => {
      const { t, v, type } = prediction;

      const tideDate = DateTime.fromSQL(t).setZone('America/Los_Angeles') as DateTime;

      const height = Number(Number(v).toFixed(2));

      return {
        date: tideDate,
        height,
        heightLabel: `${height} ft`,
        isDate: date.hasSame(tideDate, 'day'),
        isPrediction: true,
        money: 'not-money',
        ...sunAndMoonPosition(tideDate, latitude, longitude),
        time: twelveHourTime(tideDate),
        type: type === 'H' ? 'high tide' : 'low tide',
      };
    });

    const money = this.money(tides);

    tideEvents.forEach((tideEvent: MT.TideEvent): void => {
      const { date: tideDate, event } = tideEvent;

      const height = tideHeight(tides, tideDate);

      tides.push({
        date: tideDate,
        height,
        heightLabel: `${height} ft`,
        isDate: date.hasSame(tideDate, 'day'),
        isPrediction: false,
        money: 'not-money',
        ...sunAndMoonPosition(tideDate, latitude, longitude),
        time: twelveHourTime(tideDate),
        type: event,
      });
    });

    tides.sort((a: MT.Tide, b: MT.Tide): number => {
      return a.date.toMillis() - b.date.toMillis();
    });

    return { money, tides };
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

  private async loadStation(stationInfo: MT._StationInfo): Promise<void> {
    const { id, errorAlertId, latitude, longitude, name } = stationInfo;

    const date = this.date;

    const {
      moon,
      moon: { moonrise, moonset },
      sun,
      sun: { solarNoon, sunrise, sunset },
    } = sunAndMoon(date, latitude, longitude);

    const tideEvents: MT.TideEvent[] = [
      {
        date: solarNoon,
        event: 'solar noon',
      },
      {
        date: sunrise,
        event: 'sunrise',
      },
      {
        date: sunset,
        event: 'sunset',
      },
    ];

    if (moonrise)
      tideEvents.push({
        date: moonrise,
        event: 'moonrise',
      });

    if (moonset)
      tideEvents.push({
        date: moonset,
        event: 'moonset',
      });

    const { money, tides } = await this.getTides({
      date,
      id,
      latitude,
      longitude,
      tideEvents,
    });

    this.stations.add({
      date,
      errorAlertId,
      graphics: this.createGraphics({
        id,
        latitude,
        longitude,
        money,
        name,
        tides,
      }),
      id,
      latitude,
      longitude,
      name,
      money,
      moon,
      predictionUpdateError: false,
      predictionUpdateErrorCount: 0,
      sun,
      tides,
    });

    stationInfo.loaded = true;

    stationInfo.loadErrorCount = 0;

    this.addZoomToItem(id, name);
    try {
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

      this.alerts.add(
        <calcite-alert icon="exclamation-mark-circle" id={errorAlertId} key={KEY++} kind="danger" open scale="s">
          <div slot="message">Failed to load station data for {name}</div>
          <calcite-link
            slot="link"
            onclick={(): void => {
              this.loadStation(stationInfo);

              (document.getElementById(errorAlertId) as HTMLCalciteAlertElement).open = false;
            }}
          >
            Try again
          </calcite-link>
        </calcite-alert>,
      );

      stationInfo.loaded = false;
    }
  }

  private money(tides: MT.Tide[]): MT.MoneyType {
    // sort by height
    const _tides: MT.Tide[] = tides
      .filter((tide: MT.Tide): boolean => {
        return tide.isDate;
      })
      .toSorted((a: MT.Tide, b: MT.Tide): number => {
        return b.height - a.height;
      });

    const highestHigh: MT.Tide = _tides[0];

    // may or may not have two high tides per day
    const lowestHigh: MT.Tide | null = _tides[1].type === 'high tide' ? _tides[1] : null;

    const highestRange = this.getTimeRange(highestHigh.date);

    const lowestRange = this.getTimeRange(lowestHigh?.date);

    if (highestRange === 2) {
      tides[tides.indexOf(highestHigh)].money = 'money';
      return 'money';
    }

    if (highestRange === 1) {
      tides[tides.indexOf(highestHigh)].money = 'mostly-money';
      return 'mostly-money';
    }

    if (lowestRange === 2 && lowestHigh) {
      tides[tides.indexOf(lowestHigh)].money = 'kinda-money';
      return 'kinda-money';
    }

    if (lowestRange === 1 && lowestHigh) {
      tides[tides.indexOf(lowestHigh)].money = 'potentially-money';
      return 'potentially-money';
    }

    return 'not-money';
  }

  private tidesSymbolText(tides: MT.Tide[]): string {
    return tides
      .filter((tide: MT.Tide): boolean => {
        return tide.isPrediction && tide.isDate;
      })
      .map((tide: MT.Tide): string => {
        const { heightLabel, time, type } = tide;

        return `${time} ${type} ${heightLabel}`;
      })
      .join('\n');
  }

  private async updateStation(station: MT.Station): Promise<void> {
    const { date } = this;

    const { id, latitude, longitude, name } = station;

    try {
      const {
        moon,
        moon: { moonrise, moonset },
        sun,
        sun: { solarNoon, sunrise, sunset },
      } = sunAndMoon(date, latitude, longitude);

      const tideEvents: MT.TideEvent[] = [
        {
          date: solarNoon,
          event: 'solar noon',
        },
        {
          date: sunrise,
          event: 'sunrise',
        },
        {
          date: sunset,
          event: 'sunset',
        },
      ];

      if (moonrise)
        tideEvents.push({
          date: moonrise,
          event: 'moonrise',
        });

      if (moonset)
        tideEvents.push({
          date: moonset,
          event: 'moonset',
        });

      const { money, tides } = await this.getTides({
        date,
        id,
        latitude,
        longitude,
        tideEvents,
      });

      Object.assign(station, {
        date,
        money,
        moon,
        sun,
        tides,
      });

      this.updateGraphics(station);
    } catch (error) {}
  }

  private updateGraphics(station: MT.Station): void {
    const {
      graphics: { heatmap: heatmapGraphic, marker: markerGraphic, station: stationGraphic, tides: tidesGraphic },
      money,
      predictionUpdateError,
      tides,
    } = station;

    let { primary, secondary } = moneyTypeColors(money);

    if (predictionUpdateError) {
      primary = new Color('black');

      secondary = new Color('white');
    }

    stationGraphic.symbol = Object.assign((stationGraphic.symbol as esri.TextSymbol).clone(), {
      color: primary,
      haloColor: secondary,
    });

    markerGraphic.symbol = Object.assign((markerGraphic.symbol as esri.SimpleMarkerSymbol).clone(), {
      color: primary,
      outline: { color: secondary, width: SYMBOL_POINT.outline.width },
    });

    tidesGraphic.symbol = Object.assign((tidesGraphic.symbol as esri.TextSymbol).clone(), {
      color: predictionUpdateError ? null : primary,
      haloColor: predictionUpdateError ? null : secondary,
      text: this.tidesSymbolText(tides),
    });

    // TODO handle error for heatmap layer
    Object.assign(heatmapGraphic.attributes, { height: 0 });

    this.heatmapLayer.applyEdits({
      updateFeatures: [heatmapGraphic],
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

    this.stationInfos.forEach((stationInfo: MT._StationInfo): void => {
      const { errorAlertId, loaded } = stationInfo;

      const alert = document.getElementById(errorAlertId) as HTMLCalciteAlertElement | null;

      if (alert) alert.open = false;

      if (!loaded) this.loadStation(stationInfo);
    });

    this.stations.forEach(this.updateStation.bind(this));
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

    const station = this.stations.find((station: MT.Station): boolean => {
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
                  .map((zoomToItem: MT.ZoomToItem): tsx.JSX.Element => {
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

    stationInfos.forEach((stationInfo: MT.StationInfo): void => {
      this.loadStation({
        ...stationInfo,
        errorAlertId: `error-alert${this.id}-${KEY++}`,
        loaded: false,
        loadErrorCount: 0,
      });
    });

    this.addHandles(view.on('click', this.viewClickEvent.bind(this)));

    this.emit('loaded');

    // console.log(this.stations);

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
}
