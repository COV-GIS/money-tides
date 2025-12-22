//#region types

import esri = __esri;
import type { MT } from '../interfaces';

//#endregion

//#region components

import '@esri/calcite-components/dist/components/calcite-alert';
import '@esri/calcite-components/dist/components/calcite-button';
import '@esri/calcite-components/dist/components/calcite-dropdown';
import '@esri/calcite-components/dist/components/calcite-dropdown-group';
import '@esri/calcite-components/dist/components/calcite-dropdown-item';
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
import Graphic from '@arcgis/core/Graphic';
import Color from '@arcgis/core/Color';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Point from '@arcgis/core/geometry/Point';
import { moneyTypeColors } from '../utils/colorUtils';
import DateTime, { NOAADate, setNoon, setTime, twelveHourTime } from '../utils/dateAndTimeUtils';
import { magneticDeclination, sunAndMoon, sunAndMoonPosition } from '../utils/sunAndMoonUtils';
import createURL from '../utils/createURL';
import AboutModal from './AboutModal';
import Attribution from './Attribution';
import DisclaimerModal from './DisclaimerModal';
import LunarPhaseModal from './LunarPhaseModal';
import PlotModal from './PlotModal';
import TidesDialog from './TidesDialog';

//#endregion

//#region exports

export const tideHeight = (tides: MT.Tide[], date: DateTime): number => {
  const _tides = tides.filter((tide: MT.Tide): boolean => {
    return tide.isPrediction;
  });

  const height = -999;

  let proceeding: MT.Tide | nullish;

  _tides.forEach((tide: MT.Tide): void => {
    if (tide.date.toMillis() < date.toMillis()) proceeding = tide;
  });

  if (!proceeding) return height;

  const upcoming: MT.Tide | nullish = _tides[_tides.indexOf(proceeding) + 1];

  if (!upcoming) return height;

  const { date: proceedingDate, height: startHeight } = proceeding;

  const { date: upcomingDate, height: endHeight } = upcoming;

  const startTime = proceedingDate.toMillis();

  const endTime = upcomingDate.toMillis();

  const time = date.toMillis();

  // time does not fall between predictions
  if ((time < startTime && time < endTime) || (time > startTime && time > endTime)) {
    return height;
  } else {
    return Number((startHeight + ((endHeight - startHeight) * (time - startTime)) / (endTime - startTime)).toFixed(2));
  }
};

//#endregion

//#region constants

const CSS_BASE = 'money-tides';

const CSS = {
  header: `${CSS_BASE}_header`,
  headerButtons: `${CSS_BASE}_header--buttons`,
  headerDate: `${CSS_BASE}_header--date`,
  headerTitle: `${CSS_BASE}_header--title`,
  view: `${CSS_BASE}_view`,
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

  override postInitialize(): void {
    const { date, lunarPhaseModal } = this;

    const latitude = 44.927;

    const longitude = -124.013;

    const { moon } = sunAndMoon(date, latitude, longitude);

    lunarPhaseModal.date = date;

    lunarPhaseModal.moon = moon;

    this.addHandles(
      watch(
        (): DateTime => this.date,
        (_date: DateTime): void => {
          const { moon: _moon } = sunAndMoon(_date, latitude, longitude);

          lunarPhaseModal.date = _date;

          lunarPhaseModal.moon = _moon;
        },
      ),
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

  @property()
  private date = setNoon(DateTime.now().setZone('America/Los_Angeles'));

  private datePicker!: HTMLCalciteInputDatePickerElement;

  private disclaimerModal = new DisclaimerModal();

  private lunarPhaseModal = new LunarPhaseModal();

  @property()
  private magneticDeclination = 'unknown';

  private magneticDeclinationAlert!: HTMLCalciteAlertElement;

  private plotModal = new PlotModal();

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
          icon-start="pin-tear"
          key={KEY++}
          onclick={(): void => {
            const { view } = this;

            const station = this.stations.find((station: MT.Station): boolean => {
              return station.id === id;
            });

            if (!station) return;

            view.goTo(station.graphics.markerGraphic);

            view.scale = 60000;

            this.tidesDialog.open(station);
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

    return { markerGraphic, stationGraphic, tidesGraphic };
  }

  private async getTides(
    params: MT.GetTidesParameters,
  ): Promise<{ money: MT.MoneyType; moon: MT.Moon; sun: MT.Sun; tides: MT.Tide[] }> {
    const { date, id, latitude, longitude } = params;

    const yesterday = date.minus({ day: 1 });

    const tomorrow = date.plus({ day: 1 });

    const predictionsResponse: MT.ApiPredictionsResponse = await (
      await fetch(
        createURL('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter', {
          product: 'predictions',
          format: 'json',
          interval: 'hilo', // only high and low tides
          time_zone: 'lst_ldt', // station local time adjusted for DST
          units: 'english',
          datum: 'mllw', // must use 'mean lower low water' b/c most stations are subordinate
          station: id,
          begin_date: NOAADate(yesterday),
          end_date: NOAADate(tomorrow),
        }),
      )
    ).json();

    const tides = predictionsResponse.predictions.map((prediction: MT.ApiPrediction): MT.Tide => {
      const { t, v, type } = prediction;

      const tideDate = DateTime.fromSQL(t).setZone('America/Los_Angeles') as DateTime;

      const height = Number(Number(v).toFixed(2));

      return {
        date: tideDate,
        height,
        heightLabel: `${height} ft`,
        isDate: date.hasSame(tideDate, 'day'),
        isLunar: false,
        isPrediction: true,
        isSolar: false,
        money: 'not-money',
        ...sunAndMoonPosition(tideDate, latitude, longitude),
        time: twelveHourTime(tideDate),
        type: type === 'H' ? 'high tide' : 'low tide',
      };
    });

    const money = this.money(tides);

    const { moon: yesterdayMoon, sun: yesterdaySun } = sunAndMoon(yesterday, latitude, longitude);

    const { moon: todayMoon, sun: todaySun } = sunAndMoon(date, latitude, longitude);

    const { moon: tomorrowMoon, sun: tomorrowSun } = sunAndMoon(tomorrow, latitude, longitude);

    const tideEvents: MT.TideEvent[] = [
      {
        date: yesterdaySun.nadir,
        event: 'solar nadir',
        type: 'solar',
      },
      {
        date: yesterdaySun.solarNoon,
        event: 'solar noon',
        type: 'solar',
      },
      {
        date: yesterdaySun.sunrise,
        event: 'sunrise',
        type: 'solar',
      },
      {
        date: yesterdaySun.sunset,
        event: 'sunset',
        type: 'solar',
      },
      {
        date: todaySun.nadir,
        event: 'solar nadir',
        type: 'solar',
      },
      {
        date: todaySun.solarNoon,
        event: 'solar noon',
        type: 'solar',
      },
      {
        date: todaySun.sunrise,
        event: 'sunrise',
        type: 'solar',
      },
      {
        date: todaySun.sunset,
        event: 'sunset',
        type: 'solar',
      },
      {
        date: tomorrowSun.nadir,
        event: 'solar nadir',
        type: 'solar',
      },
      {
        date: tomorrowSun.solarNoon,
        event: 'solar noon',
        type: 'solar',
      },
      {
        date: tomorrowSun.sunrise,
        event: 'sunrise',
        type: 'solar',
      },
      {
        date: tomorrowSun.sunset,
        event: 'sunset',
        type: 'solar',
      },
    ];

    if (yesterdayMoon.moonrise)
      tideEvents.push({
        date: yesterdayMoon.moonrise,
        event: 'moonrise',
        type: 'lunar',
      });

    if (yesterdayMoon.moonset)
      tideEvents.push({
        date: yesterdayMoon.moonset,
        event: 'moonset',
        type: 'lunar',
      });

    if (todayMoon.moonrise)
      tideEvents.push({
        date: todayMoon.moonrise,
        event: 'moonrise',
        type: 'lunar',
      });

    if (todayMoon.moonset)
      tideEvents.push({
        date: todayMoon.moonset,
        event: 'moonset',
        type: 'lunar',
      });

    if (tomorrowMoon.moonrise)
      tideEvents.push({
        date: tomorrowMoon.moonrise,
        event: 'moonrise',
        type: 'lunar',
      });

    if (tomorrowMoon.moonset)
      tideEvents.push({
        date: tomorrowMoon.moonset,
        event: 'moonset',
        type: 'lunar',
      });

    tideEvents.forEach((tideEvent: MT.TideEvent): void => {
      const { date: tideDate, event, type: eventType } = tideEvent;

      const height = tideHeight(tides, tideDate);

      tides.push({
        date: tideDate,
        height,
        heightLabel: `${height} ft`,
        isDate: date.hasSame(tideDate, 'day'),
        isLunar: eventType === 'lunar',
        isPrediction: false,
        isSolar: eventType === 'solar',
        money: 'not-money',
        ...sunAndMoonPosition(tideDate, latitude, longitude),
        time: twelveHourTime(tideDate),
        type: event,
      });
    });

    tides.sort((a: MT.Tide, b: MT.Tide): number => {
      return a.date.toMillis() - b.date.toMillis();
    });

    tides
      .filter((tide: MT.Tide): boolean => {
        return tide.isLunar;
      })
      .forEach((tide: MT.Tide, index: number, array: MT.Tide[]): void => {
        const { date: tideDate, type } = tide;

        let culminationDate: DateTime | nullish;

        let height: number | nullish;

        if (type === 'moonrise') {
          const moonset = array[index + 1];

          if (moonset) {
            culminationDate = DateTime.fromMillis(Math.floor((tideDate.toMillis() + moonset.date.toMillis()) / 2));

            height = tideHeight(tides, culminationDate);

            tides.push({
              date: culminationDate,
              height,
              heightLabel: `${height} ft`,
              isDate: date.hasSame(culminationDate, 'day'),
              isLunar: true,
              isPrediction: false,
              isSolar: false,
              money: 'not-money',
              ...sunAndMoonPosition(culminationDate, latitude, longitude),
              time: twelveHourTime(culminationDate),
              type: 'lunar noon',
            });
          }
        }

        if (type === 'moonset') {
          const moonrise = array[index + 1];

          if (moonrise) {
            culminationDate = DateTime.fromMillis(Math.floor((tideDate.toMillis() + moonrise.date.toMillis()) / 2));

            height = tideHeight(tides, culminationDate);

            tides.push({
              date: culminationDate,
              height,
              heightLabel: `${height} ft`,
              isDate: date.hasSame(culminationDate, 'day'),
              isLunar: true,
              isPrediction: false,
              isSolar: false,
              money: 'not-money',
              ...sunAndMoonPosition(culminationDate, latitude, longitude),
              time: twelveHourTime(culminationDate),
              type: 'lunar nadir',
            });
          }
        }
      });

    tides.sort((a: MT.Tide, b: MT.Tide): number => {
      return a.date.toMillis() - b.date.toMillis();
    });

    return { money, moon: todayMoon, sun: todaySun, tides };
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
    try {
      const { id, latitude, longitude, name, weather } = stationInfo;

      const date = this.date;

      const { money, moon, sun, tides } = await this.getTides({
        date,
        id,
        latitude,
        longitude,
      });

      this.stations.add({
        date,
        error: false,
        errorCount: 0,
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
        sun,
        tides,
        weather,
      });

      this.addZoomToItem(id, name);

      stationInfo.loaded = true;
    } catch (error) {
      console.log('load error', error);

      if (stationInfo.errorCount !== 10) {
        stationInfo.errorCount++;

        setTimeout((): void => {
          this.loadStation(stationInfo);
        }, stationInfo.errorCount * 50);

        return;
      }

      const alertId = `station-error-alert-${stationInfo.id}`;

      const errorAlert = this.container.querySelector(`#${alertId}`) as HTMLCalciteAlertElement | nullish;

      if (errorAlert) {
        errorAlert.open = true;

        return;
      }

      this.alerts.add(
        <calcite-alert
          auto-close=""
          auto-close-duration="fast"
          icon="exclamation-mark-circle"
          id={alertId}
          key={KEY++}
          kind="danger"
          open
          scale="s"
          slot="alerts"
        >
          <div slot="title">Error</div>
          <div slot="message">Failed to load station data for {stationInfo.name}</div>
        </calcite-alert>,
      );
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
    const { date, tidesDialog } = this;

    const { id, latitude, longitude } = station;

    try {
      const { money, moon, sun, tides } = await this.getTides({
        date,
        id,
        latitude,
        longitude,
      });

      Object.assign(station, {
        date,
        money,
        moon,
        sun,
        tides,
      });

      this.updateGraphics(station);

      if (tidesDialog.container.open && tidesDialog.station.id === id) {
        tidesDialog.open(station);
      }

      station.error = false;

      station.errorCount = 0;

      const errorAlert = this.container.querySelector(`#station-error-alert-${id}`) as
        | HTMLCalciteAlertElement
        | nullish;

      if (errorAlert) errorAlert.open = false;
    } catch (error) {
      console.log('update error', error);

      if (station.errorCount !== 10) {
        station.errorCount++;

        setTimeout((): void => {
          this.updateStation(station);
        }, station.errorCount * 50);

        return;
      }

      const alertId = `station-error-alert-${station.id}`;

      const errorAlert = this.container.querySelector(`#${alertId}`) as HTMLCalciteAlertElement | nullish;

      if (errorAlert) {
        errorAlert.open = true;

        return;
      }

      station.error = true;

      station.errorCount = 0;

      if (tidesDialog.container.open && tidesDialog.station.id === id) {
        tidesDialog.close();
      }

      this.alerts.add(
        <calcite-alert
          auto-close=""
          auto-close-duration="fast"
          icon="exclamation-mark-circle"
          id={alertId}
          key={KEY++}
          kind="danger"
          open
          scale="s"
          slot="alerts"
        >
          <div slot="title">Error</div>
          <div slot="message">Failed to load station data for {station.name}</div>
        </calcite-alert>,
      );
    }
  }

  private updateGraphics(station: MT.Station): void {
    const {
      error,
      graphics: { markerGraphic, stationGraphic, tidesGraphic },
      money,
      tides,
    } = station;

    let { primary, secondary } = moneyTypeColors(money);

    if (error) {
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
      color: error ? null : primary,
      haloColor: error ? null : secondary,
      text: this.tidesSymbolText(tides),
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

    this.stations.forEach(this.updateStation.bind(this));
  }

  private dateButtonClickEvent(event: Event) {
    const type = (event.target as HTMLCalciteButtonElement).iconStart as 'chevron-left' | 'chevron-right';

    const date = (this.date = type === 'chevron-right' ? this.date.plus({ days: 1 }) : this.date.minus({ days: 1 }));

    this.datePicker.value = date.toISODate() as string;

    this.datePicker.dispatchEvent(new Event('calciteInputDatePickerChange'));
  }

  private async magneticDeclinationDropdownItemClickEvent(): Promise<void> {
    try {
      this.magneticDeclination = (await magneticDeclination(this.date, 44.927, -124.013, true)) as string;

      this.magneticDeclinationAlert.open = true;
    } catch (error) {
      console.log(error);
    }
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

    if (!station || (station && station.error)) return;

    tidesDialog.open(station);
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    const { alerts, magneticDeclination, zoomToDropdownItems } = this;

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

            <calcite-dropdown scale="s">
              <calcite-button icon-start="information" scale="s" slot="trigger"></calcite-button>
              <calcite-dropdown-group selection-mode="none">
                <calcite-dropdown-item
                  icon-start="moon"
                  onclick={(): void => {
                    this.lunarPhaseModal.open();
                  }}
                >
                  Lunar Phase
                </calcite-dropdown-item>
                <calcite-dropdown-item
                  icon-start="explore"
                  onclick={this.magneticDeclinationDropdownItemClickEvent.bind(this)}
                >
                  Magnetic Declination
                </calcite-dropdown-item>
                <calcite-dropdown-item
                  icon-start="question"
                  onclick={(): void => {
                    this.aboutModal.open();
                  }}
                >
                  About
                </calcite-dropdown-item>
              </calcite-dropdown-group>
            </calcite-dropdown>
          </div>
        </div>

        {/* alerts */}
        {alerts.toArray()}

        <calcite-alert
          auto-close=""
          icon="explore"
          kind="info"
          scale="s"
          afterCreate={this.magneticDeclinationAlertAfterCreate.bind(this)}
        >
          <div slot="message">Today's magnetic declination is {magneticDeclination}.</div>
        </calcite-alert>

        {/* dialogs */}
        <calcite-dialog slot="dialogs" afterCreate={this.disclaimerModalAfterCreate.bind(this)}></calcite-dialog>
        <calcite-dialog slot="dialogs" afterCreate={this.tidesDialogAfterCreate.bind(this)}></calcite-dialog>
        <calcite-dialog slot="dialogs" afterCreate={this.aboutModalAfterCreate.bind(this)}></calcite-dialog>
        <calcite-dialog slot="dialogs" afterCreate={this.lunarPhaseModalAfterCreate.bind(this)}></calcite-dialog>
        <calcite-dialog slot="dialogs" afterCreate={this.plotModalAfterCreate.bind(this)}></calcite-dialog>

        {/* view */}
        <div class={CSS.view} afterCreate={this.viewAfterCreate.bind(this)}></div>
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

  private disclaimerModalAfterCreate(dialog: HTMLCalciteDialogElement): void {
    this.disclaimerModal.container = dialog;
  }

  private lunarPhaseModalAfterCreate(dialog: HTMLCalciteDialogElement): void {
    this.lunarPhaseModal.container = dialog;
  }

  private magneticDeclinationAlertAfterCreate(alert: HTMLCalciteAlertElement) {
    this.magneticDeclinationAlert = alert;
  }

  private plotModalAfterCreate(dialog: HTMLCalciteDialogElement): void {
    this.plotModal.container = dialog;
  }

  private tidesDialogAfterCreate(dialog: HTMLCalciteDialogElement): void {
    const { plotModal, tidesDialog } = this;

    tidesDialog.container = dialog;

    this.addHandles(tidesDialog.on('plot-tides', plotModal.open.bind(plotModal)));
  }

  private async viewAfterCreate(container: HTMLDivElement): Promise<void> {
    const { disclaimerModal, stationInfos } = this;

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

    stationInfos.forEach((stationInfo: MT._StationInfo): void => {
      stationInfo.errorCount = 0;

      stationInfo.loaded = false;

      this.loadStation(stationInfo);
    });

    this.addHandles(view.on('click', this.viewClickEvent.bind(this)));

    if (!DisclaimerModal.isAccepted()) disclaimerModal.container.open = true;

    this.emit('loaded');

    // setTimeout((): void => {
    //   console.log(view.extent.toJSON());
    // }, 10000);
  }

  //#endregion
}
