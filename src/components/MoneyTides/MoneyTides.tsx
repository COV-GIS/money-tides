//#region types

import esri = __esri;
import type { MT } from '../../interfaces';
import type AdvisoriesPanel from '../AdvisoriesPanel/AdvisoriesPanel';
import type LayersPanel from '../LayersPanel/LayersPanel';
import type LunarPhasePanel from '../LunarPhasePanel/LunarPhasePanel';
import type TidesDialog from '../TidesDialog/TidesDialog';
type Panels = AdvisoriesPanel | LayersPanel | LunarPhasePanel | null;

//#endregion

//#region modules

import './MoneyTides.scss';
import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import DateTime, { NOAADate, setNoon, setTime, twelveHourTime } from '../../utils/dateAndTimeUtils';
import { sunAndMoon, sunAndMoonPosition } from '../../utils/sunAndMoonUtils';
import { getSymbols, updateSymbols } from '../../utils/symbolUtils';
import createURL from '../../utils/createURL';

import { applicationSettings, stationInfos, view } from '../../app-config';

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
  headerDate: `${CSS_BASE}_header--date`,
  view: `${CSS_BASE}_view`,
};

let KEY = 0;

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

  constructor(properties?: esri.WidgetProperties) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);

    const { zoomToDropdownItems } = this;

    this.addHandles([
      watch(
        () => applicationSettings.colorType,
        (): void => {
          this.stations.forEach(this.updateGraphics.bind(this));
        },
      ),
      zoomToDropdownItems.on('after-add', (): void => {
        zoomToDropdownItems.sort((a: MT.ZoomToItem, b: MT.ZoomToItem): number => {
          if (a.name < b.name) return -1;

          if (a.name > b.name) return 1;

          return 0;
        });
      }),
    ]);
  }

  // override async postInitialize(): Promise<void> {}

  //#endregion

  //#region private properties

  private advisoriesPanel!: AdvisoriesPanel;

  private alerts: esri.Collection<tsx.JSX.Element> = new Collection();

  private datePicker!: HTMLCalciteInputDatePickerElement;

  private layersPanel!: LayersPanel;

  private lunarPhasePanel!: LunarPhasePanel;

  private panelHideMethods: Array<() => void> = [];

  private stations: esri.Collection<MT.Station> = new Collection();

  private tidesDialog!: TidesDialog;

  @property()
  private visiblePanel: Panels = null;

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
    const { graphics } = view;

    const { id, latitude, longitude, money, name, tides } = params;

    // const { primary, secondary } = moneyTypeColors(money);

    const { crabSymbol, markerSymbol, stationSymbol, tidesSymbol } = getSymbols({ money, name, tides });

    const attributes = { id };

    const geometry = new Point({
      latitude,
      longitude,
    });

    const crabGraphic = new Graphic({
      attributes,
      geometry,
      symbol: crabSymbol,
    });

    const markerGraphic = new Graphic({
      attributes,
      geometry,
      symbol: markerSymbol,
    });

    const stationGraphic = new Graphic({
      attributes,
      geometry,
      symbol: stationSymbol,
    });

    const tidesGraphic = new Graphic({
      attributes,
      geometry,
      symbol: tidesSymbol,
      visible: view.scale < 240000,
    });

    // const markerGraphic = new Graphic({
    //   attributes,
    //   geometry,
    //   symbol: Object.assign(SYMBOL_POINT.clone(), {
    //     color: primary,
    //     outline: { color: secondary, width: SYMBOL_POINT.outline.width },
    //   }),
    // });

    // const stationGraphic = new Graphic({
    //   attributes,
    //   geometry,
    //   symbol: Object.assign(SYMBOL_NAME.clone(), { color: primary, haloColor: secondary, text: name }),
    // });

    // const tidesGraphic = new Graphic({
    //   attributes,
    //   geometry,
    //   symbol: Object.assign(SYMBOL_TIDES.clone(), {
    //     color: primary,
    //     haloColor: secondary,
    //     text: this.tidesSymbolText(tides),
    //   }),
    //   visible: view.scale < 240000,
    // });

    this.addHandles(
      watch(
        (): number => view.scale,
        (): void => {
          tidesGraphic.visible = view.scale < 240000;
        },
      ),
    );

    graphics.addMany([markerGraphic, crabGraphic, stationGraphic, tidesGraphic]);

    return { crabGraphic, markerGraphic, stationGraphic, tidesGraphic };
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

      const date = applicationSettings.date;

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
          icon="exclamation-mark-triangle"
          id={alertId}
          key={KEY++}
          kind="danger"
          open
          scale={applicationSettings.scale}
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

  private updateGraphics(station: MT.Station): void {
    const {
      error,
      graphics: { crabGraphic, markerGraphic, stationGraphic, tidesGraphic },
      money,
      name,
      tides,
    } = station;

    const { crabSymbol, markerSymbol, stationSymbol, tidesSymbol } = updateSymbols({ error, money, name, tides });

    crabGraphic.symbol = crabSymbol;

    markerGraphic.symbol = markerSymbol;

    stationGraphic.symbol = stationSymbol;

    tidesGraphic.symbol = tidesSymbol;
  }

  private async updateStation(station: MT.Station): Promise<void> {
    const { tidesDialog } = this;

    const date = applicationSettings.date;

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

      station.error = false;

      station.errorCount = 0;

      this.updateGraphics(station);

      if (tidesDialog.container.open && tidesDialog.station.id === id) {
        tidesDialog.open(station);
      }

      const errorAlert = this.container.querySelector(`#station-error-alert-${id}`) as
        | HTMLCalciteAlertElement
        | nullish;

      if (errorAlert) errorAlert.open = false;
    } catch (error) {
      console.log('update error', error);

      station.error = true;

      this.updateGraphics(station);

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

      station.errorCount = 0;

      if (tidesDialog.container.open && tidesDialog.station.id === id) {
        tidesDialog.close();
      }

      this.alerts.add(
        <calcite-alert
          auto-close=""
          auto-close-duration="fast"
          icon="exclamation-mark-triangle"
          id={alertId}
          key={KEY++}
          kind="danger"
          open
          scale={applicationSettings.scale}
          slot="alerts"
        >
          <div slot="title">Error</div>
          <div slot="message">Failed to load station data for {station.name}</div>
        </calcite-alert>,
      );
    }
  }

  //#endregion

  //#region events

  private dateChangeEvent(event: Event): void {
    applicationSettings.date = setNoon(
      DateTime.fromISO((event.target as HTMLCalciteInputDatePickerElement).value as string).setZone(
        'America/Los_Angeles',
      ),
    );

    this.stations.forEach(this.updateStation.bind(this));
  }

  private dateButtonClickEvent(event: Event) {
    const type = (event.target as HTMLCalciteButtonElement).iconStart as 'chevron-left' | 'chevron-right';

    const date = (applicationSettings.date =
      type === 'chevron-right'
        ? applicationSettings.date.plus({ days: 1 })
        : applicationSettings.date.minus({ days: 1 }));

    this.datePicker.value = date.toISODate() as string;

    this.datePicker.dispatchEvent(new Event('calciteInputDatePickerChange'));
  }

  private actionClickEvent(panel: Panels): void {
    if (!panel) {
      for (const hide of this.panelHideMethods) {
        hide();
      }

      this.visiblePanel = null;

      return;
    }

    if (panel && this.visiblePanel === panel) {
      panel.hide();

      this.visiblePanel = null;

      return;
    }

    if (panel && this.visiblePanel !== panel) this.visiblePanel?.hide();

    this.tidesDialog.close();

    panel.show();

    this.visiblePanel = panel;
  }

  private async viewClickEvent(event: esri.ViewClickEvent): Promise<void> {
    event.stopPropagation();

    const { tidesDialog } = this;

    const result = (await view.hitTest(event, { include: [view.graphics] })).results[0];

    if (!result || result.type !== 'graphic') {
      tidesDialog.close();

      return;
    }

    const station = this.stations.find((station: MT.Station): boolean => {
      return station.id === result.graphic.attributes.id;
    });

    if (!station || (station && station.error)) return;

    this.actionClickEvent(null);

    tidesDialog.open(station);
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    const scale = applicationSettings.scale;

    const { alerts, visiblePanel, zoomToDropdownItems } = this;

    const shellPanelStyle = visiblePanel === this.lunarPhasePanel ? '--calcite-shell-panel-min-width: 260px;' : '';

    return (
      <calcite-shell content-behind="">
        {/* header */}
        <div class={CSS.header} slot="header">
          <div class={CSS.headerDate}>
            <calcite-button
              icon-start="chevron-left"
              scale={scale}
              onclick={this.dateButtonClickEvent.bind(this)}
            ></calcite-button>
            <calcite-input-date-picker
              overlay-positioning="fixed"
              scale={scale}
              afterCreate={this.datePickerAfterCreate.bind(this)}
            ></calcite-input-date-picker>
            <calcite-button
              icon-start="chevron-right"
              scale={scale}
              onclick={this.dateButtonClickEvent.bind(this)}
            ></calcite-button>
          </div>
        </div>
        {/* shell panel */}
        <calcite-shell-panel
          display-mode="float-content"
          position={applicationSettings.layout}
          slot={`panel-${applicationSettings.layout}`}
          style={shellPanelStyle}
        >
          <calcite-action-bar scale={scale} slot="action-bar" afterCreate={this.actionBarAfterCreate.bind(this)}>
            {/* actions */}
            <calcite-action-group>
              <calcite-dropdown placement="left" offset-distance="10" offset-skidding="10" scale={scale}>
                <calcite-action
                  icon="zoom-to-object"
                  scale={scale}
                  slot="trigger"
                  text="Zoom To"
                  onclick={this.actionClickEvent.bind(this, null)}
                ></calcite-action>
                <calcite-dropdown-group group-title="Zoom to" selection-mode="none">
                  {zoomToDropdownItems
                    .map((zoomToItem: MT.ZoomToItem): tsx.JSX.Element => {
                      return zoomToItem.element;
                    })
                    .toArray()}
                </calcite-dropdown-group>
              </calcite-dropdown>
              <calcite-action
                active={this.layersPanel === visiblePanel}
                icon="layers"
                scale={scale}
                text="Layers"
                onclick={this.actionClickEvent.bind(this, this.layersPanel)}
              ></calcite-action>
              <calcite-action
                active={this.advisoriesPanel === visiblePanel}
                icon="exclamation-mark-triangle"
                scale={scale}
                text="Advisories"
                onclick={this.actionClickEvent.bind(this, this.advisoriesPanel)}
              ></calcite-action>
              <calcite-action
                active={this.lunarPhasePanel === visiblePanel}
                icon="moon"
                scale={scale}
                text="Lunar Phase"
                onclick={this.actionClickEvent.bind(this, this.lunarPhasePanel)}
              ></calcite-action>
              <calcite-action
                onclick={this.actionClickEvent.bind(this, null)}
                afterCreate={async (container: HTMLCalciteActionElement): Promise<void> => {
                  new (await import('../DeclinationPopover/DeclinationAction')).default({ container });
                }}
              ></calcite-action>
            </calcite-action-group>
            {/* actions end */}
            <calcite-action-group slot="actions-end">
              <calcite-action
                afterCreate={async (container: HTMLCalciteActionElement): Promise<void> => {
                  new (await import('../FullscreenAction/FullscreenAction')).default({ container });
                }}
              ></calcite-action>
              <calcite-action
                onclick={this.actionClickEvent.bind(this, null)}
                afterCreate={async (container: HTMLCalciteActionElement): Promise<void> => {
                  new (await import('../SettingsPopover/SettingsAction')).default({ container });
                }}
              ></calcite-action>
              <calcite-action
                onclick={this.actionClickEvent.bind(this, null)}
                afterCreate={async (container: HTMLCalciteActionElement): Promise<void> => {
                  new (await import('../AttributionPopover/AttributionAction')).default({ container });
                }}
              ></calcite-action>
              <calcite-action
                afterCreate={async (container: HTMLCalciteActionElement): Promise<void> => {
                  new (await import('../AboutDialog/AboutAction')).default({ container });
                }}
              ></calcite-action>
            </calcite-action-group>
          </calcite-action-bar>
          {/* panels */}
          <calcite-panel
            afterCreate={async (container: HTMLCalcitePanelElement): Promise<void> => {
              const panel = (this.layersPanel = new (await import('../LayersPanel/LayersPanel')).default({
                container,
              }));

              this.panelHideMethods.push(panel.hide.bind(panel));

              this.addHandles(
                panel.on('close', (): void => {
                  this.visiblePanel = null;
                }),
              );
            }}
          ></calcite-panel>
          <calcite-panel
            afterCreate={async (container: HTMLCalcitePanelElement): Promise<void> => {
              const panel = (this.advisoriesPanel = new (await import('../AdvisoriesPanel/AdvisoriesPanel')).default({
                container,
              }));

              this.panelHideMethods.push(panel.hide.bind(panel));

              this.addHandles(
                panel.on('close', (): void => {
                  this.visiblePanel = null;
                }),
              );
            }}
          ></calcite-panel>
          <calcite-panel
            afterCreate={async (container: HTMLCalcitePanelElement): Promise<void> => {
              const panel = (this.lunarPhasePanel = new (await import('../LunarPhasePanel/LunarPhasePanel')).default({
                container,
              }));

              this.panelHideMethods.push(panel.hide.bind(panel));

              this.addHandles(
                panel.on('close', (): void => {
                  this.visiblePanel = null;
                }),
              );
            }}
          ></calcite-panel>
        </calcite-shell-panel>
        {/* alerts */}
        {alerts.toArray()}
        {/* tide dialog */}
        <calcite-dialog slot="dialogs" afterCreate={this.tidesDialogAfterCreate.bind(this)}></calcite-dialog>
        {/* view */}
        <div class={CSS.view} afterCreate={this.viewAfterCreate.bind(this)}></div>
      </calcite-shell>
    );
  }

  private actionBarAfterCreate(actionBar: HTMLCalciteActionBarElement): void {
    const setPadding = (): void => {
      const width = actionBar.getBoundingClientRect().width;
      view.padding = {
        ...view.padding,
        right: width,
      };
    };

    setPadding();

    new ResizeObserver((): void => {
      setPadding();
    }).observe(actionBar);
  }

  private datePickerAfterCreate(datePicker: HTMLCalciteInputDatePickerElement): void {
    const today = applicationSettings.date.toISODate() as string;

    datePicker.value = today;

    datePicker.addEventListener('calciteInputDatePickerChange', this.dateChangeEvent.bind(this));

    this.datePicker = datePicker;
  }

  private async tidesDialogAfterCreate(container: HTMLCalciteDialogElement): Promise<void> {
    this.tidesDialog = new (await import('../TidesDialog/TidesDialog')).default({ container });

    const plotDialog = new (await import('../PlotDialog/PlotDialog')).default();

    this.addHandles(this.tidesDialog.on('plot-tides', plotDialog.open.bind(plotDialog)));
  }

  private async viewAfterCreate(container: HTMLDivElement): Promise<void> {
    view.container = container;

    view.ui.remove(['attribution', 'zoom']);

    for (const stationInfo of stationInfos) {
      Object.assign(stationInfo, {
        errorCount: 0,
        loaded: false,
      });

      // await this.loadStation(stationInfo as MT._StationInfo);
      this.loadStation(stationInfo as MT._StationInfo);
    }

    this.addHandles(view.on('click', this.viewClickEvent.bind(this)));

    this.emit('loaded');

    // setTimeout((): void => {
    //   console.log(view.extent.toJSON());
    // }, 10000);
  }

  //#endregion
}
