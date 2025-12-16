//#region types

import esri = __esri;

import type { MoonTimeInfo, Prediction, Station, SunTimeInfo, TideTimeInfo } from '../typings';

//#endregion

//#region components

import '@esri/calcite-components/dist/components/calcite-action';
import '@esri/calcite-components/dist/components/calcite-action-group';
import '@esri/calcite-components/dist/components/calcite-alert';
import '@esri/calcite-components/dist/components/calcite-dialog';
import '@esri/calcite-components/dist/components/calcite-notice';
import '@esri/calcite-components/dist/components/calcite-table';
import '@esri/calcite-components/dist/components/calcite-table-row';

//#endregion

//#region modules

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import createURL from '../utils/createURL';
import DateTime, { NOAADate, twelveHourTime } from '../utils/dateAndTimeUtils';
import { moneyTypeColorHex } from '../utils/colorUtils';
import {
  altitudeToDegrees,
  azimuthToBearing,
  magneticDeclination,
  moonPosition,
  sunPosition,
} from '../utils/sunAndMoonUtils';
import { tideHeightAtTime } from '../utils/tideUtils';
import MoonInfo from './MoonInfo';

//#endregion

//#region constants

let KEY = 0;

//#endregion

@subclass('TidesDialog')
export default class TidesDialog extends Widget {
  //#region lifecycle

  private _container!: HTMLCalciteDialogElement;

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteDialogElement) {
    this._container = value;
  }

  postInitialize(): void {
    this.container.addEventListener('calciteDialogClose', (): void => {
      this.content = 'tides';
      this.magneticDeclinationAlert.open = false;
    });

    this.addHandles(
      watch(
        () => this.content,
        (): void => {
          this.magneticDeclinationAlert.open = false;
        },
      ),
    );
  }

  //#endregion

  //#region public properties

  public station!: Station;

  //#endregion

  //#region private properties

  @property()
  private content: 'tides' | 'sun' | 'moon' = 'tides';

  @property()
  private magneticDeclination = '';

  private magneticDeclinationAlert!: HTMLCalciteAlertElement;

  private moonInfo = new MoonInfo();

  private moonTimeInfos: esri.Collection<MoonTimeInfo> = new Collection();

  private sunTimeInfos: esri.Collection<SunTimeInfo> = new Collection();

  private tideTimeInfos: esri.Collection<TideTimeInfo> = new Collection();

  //#endregion

  //#region public methods

  close(): void {
    this.container.open = false;
  }

  open(station: Station): void {
    this.station = station;

    this.moonTimes(station);

    this.sunTimes(station);

    this.tideTimes(station);

    this.renderNow();

    this.moonInfo.station = station;

    this.container.open = true;
  }

  //#endregion

  //#region private methods

  private openStationUrl(type: 'home' | number): void {
    const { date, id } = this.station;

    if (type === 'home') {
      window.open(createURL('https://tidesandcurrents.noaa.gov/stationhome.html', { id }), '_blank');

      return;
    }

    const start = date;

    const end = type === 1 ? start : start.plus({ days: type });

    window.open(
      createURL('https://tidesandcurrents.noaa.gov/noaatidepredictions.html', {
        action: 'dailychart',
        bdate: NOAADate(start),
        clock: 12,
        datum: 'MLLW',
        edate: NOAADate(end),
        id,
        interval: 'hilo',
        timezone: 'LST/LDT',
        units: 'standard',
      }),
      '_blank',
    );
  }

  private async showMagneticDeclination(): Promise<void> {
    const { date, latitude, longitude } = this.station;

    try {
      this.magneticDeclination = (await magneticDeclination(date, latitude, longitude, true)) as string;

      this.magneticDeclinationAlert.open = true;
    } catch (error) {
      console.log(error);
    }
  }

  private moonTimes(station: Station): void {
    const {
      latitude,
      longitude,
      moonTimes: { rise: moonrise, set: moonset },
      predictions,
    } = station;

    const moonTimeInfos: esri.Collection<MoonTimeInfo> = new Collection(
      predictions
        .filter((prediction: Prediction): boolean => {
          return prediction.moonPosition.altitude >= 0;
        })
        .map((prediction: Prediction): MoonTimeInfo => {
          const {
            date,
            moonPosition: { altitude, azimuth },
            tideType,
            time,
          } = prediction;

          return {
            altitude: altitudeToDegrees(altitude),
            bearing: azimuthToBearing(azimuth),
            date,
            event: `${tideType} tide`,
            time,
          };
        }),
    );

    if (moonrise) {
      const moonrisePosition = moonPosition(moonrise, latitude, longitude);

      if (moonrisePosition.altitude >= 0)
        moonTimeInfos.add({
          altitude: altitudeToDegrees(moonrisePosition.altitude),
          bearing: azimuthToBearing(moonrisePosition.azimuth),
          date: DateTime.fromJSDate(moonrise),
          event: 'moonrise',
          time: twelveHourTime(moonrise),
        });
    }

    if (moonset) {
      const moonsetPosition = moonPosition(moonset, latitude, longitude);

      if (moonsetPosition.altitude >= 0)
        moonTimeInfos.add({
          altitude: altitudeToDegrees(moonsetPosition.altitude),
          bearing: azimuthToBearing(moonsetPosition.azimuth),
          date: DateTime.fromJSDate(moonset),
          event: 'moonset',
          time: twelveHourTime(moonset),
        });
    }

    moonTimeInfos.sort((a: MoonTimeInfo, b: MoonTimeInfo): number => {
      return a.date.toMillis() - b.date.toMillis();
    });

    this.moonTimeInfos = moonTimeInfos;
  }

  private showContent(content: 'tides' | 'sun' | 'moon'): void {
    if (content !== this.content) this.content = content;
  }

  private sunTimes(station: Station): void {
    const {
      latitude,
      longitude,
      predictions,
      sunTimes: { solarNoon, sunrise, sunset },
    } = station;

    const sunTimeInfos: esri.Collection<SunTimeInfo> = new Collection(
      predictions
        .filter((prediction: Prediction): boolean => {
          return prediction.sunPosition.altitude >= 0;
        })
        .map((prediction: Prediction): SunTimeInfo => {
          const {
            date,
            sunPosition: { altitude, azimuth },
            tideType,
            time,
          } = prediction;

          return {
            altitude: altitudeToDegrees(altitude),
            bearing: azimuthToBearing(azimuth),
            date,
            event: `${tideType} tide`,
            time,
          };
        }),
    );

    sunTimeInfos.addMany([
      {
        altitude: altitudeToDegrees(sunPosition(solarNoon, latitude, longitude).altitude),
        bearing: 'S',
        date: DateTime.fromJSDate(solarNoon),
        event: 'solar noon',
        time: twelveHourTime(solarNoon),
      },
      {
        altitude: '0°',
        bearing: azimuthToBearing(sunPosition(sunrise, latitude, longitude).azimuth),
        date: DateTime.fromJSDate(sunrise),
        event: 'sunrise',
        time: twelveHourTime(sunrise),
      },
      {
        altitude: '0°',
        bearing: azimuthToBearing(sunPosition(sunset, latitude, longitude).azimuth),
        date: DateTime.fromJSDate(sunset),
        event: 'sunset',
        time: twelveHourTime(sunset),
      },
    ]);

    sunTimeInfos.sort((a: SunTimeInfo, b: SunTimeInfo): number => {
      return a.date.toMillis() - b.date.toMillis();
    });

    this.sunTimeInfos = sunTimeInfos;
  }

  private tideTimes(station: Station): void {
    const {
      moonTimes: { rise: moonrise, set: moonset },
      predictions,
      sunTimes: { solarNoon, sunrise, sunset },
      tides,
    } = station;

    const tideTimeInfos: esri.Collection<TideTimeInfo> = new Collection(
      predictions.map((prediction: Prediction): TideTimeInfo => {
        const { date, height, moneyType, tideType, time } = prediction;

        return {
          date,
          event: `${tideType} tide`,
          style: [
            moneyType !== 'not-money'
              ? `--calcite-table-row-background-color: ${moneyTypeColorHex(
                  moneyType,
                )}; font-weight: var(--calcite-font-weight-medium);`
              : '',
            moneyType === 'money' ? '--calcite-table-cell-text-color: #ffffff' : '',
          ].join(' '),
          time,
          height: `${height} ft`,
        };
      }),
    );

    tideTimeInfos.addMany([
      {
        date: DateTime.fromJSDate(solarNoon),
        event: 'solar noon',
        // event: `solar noon (S @ ${altitudeToDegrees(sunPosition(solarNoon, latitude, longitude).altitude)})`,
        time: twelveHourTime(solarNoon),
        height: `${tideHeightAtTime(tides, DateTime.fromJSDate(solarNoon))} ft`,
      },
      {
        date: DateTime.fromJSDate(sunrise),
        event: 'sunrise',
        // event: `sunrise (${azimuthToBearing(sunPosition(sunrise, latitude, longitude).azimuth)} @ 0°)`,
        time: twelveHourTime(sunrise),
        height: `${tideHeightAtTime(tides, DateTime.fromJSDate(sunrise))} ft`,
      },
      {
        date: DateTime.fromJSDate(sunset),
        event: 'sunset',
        // event: `sunset (${azimuthToBearing(sunPosition(sunset, latitude, longitude).azimuth)} @ 0°)`,
        time: twelveHourTime(sunset),
        height: `${tideHeightAtTime(tides, DateTime.fromJSDate(sunset))} ft`,
      },
    ]);

    if (moonrise)
      tideTimeInfos.add({
        date: DateTime.fromJSDate(moonrise),
        event: 'moonrise',
        time: twelveHourTime(moonrise),
        height: `${tideHeightAtTime(tides, DateTime.fromJSDate(moonrise))} ft`,
      });

    if (moonset)
      tideTimeInfos.add({
        date: DateTime.fromJSDate(moonset),
        event: 'moonset',
        time: twelveHourTime(moonset),
        height: `${tideHeightAtTime(tides, DateTime.fromJSDate(moonset))} ft`,
      });

    tideTimeInfos.sort((a: TideTimeInfo, b: TideTimeInfo): number => {
      return a.date.toMillis() - b.date.toMillis();
    });

    this.tideTimeInfos = tideTimeInfos;
  }

  //#endregion

  //#region render

  render(): tsx.JSX.Element {
    const { content, station } = this;

    if (!station) return <calcite-dialog></calcite-dialog>;

    const { magneticDeclination, moonTimeInfos, sunTimeInfos, tideTimeInfos } = this;

    const { date, name } = station;

    const heading = `${name} - ${date.toLocaleString(DateTime.DATE_FULL)}`;

    return (
      <calcite-dialog
        heading={heading}
        placement="bottom-start"
        scale="s"
        style="--calcite-dialog-min-size-y: 0; --calcite-dialog-max-size-x: 420px; --calcite-dialog-content-space: 0;"
        width="s"
      >
        {/* header menu actions */}
        <calcite-action
          icon="home"
          scale="s"
          slot="header-menu-actions"
          text="Home"
          text-enabled=""
          onclick={this.openStationUrl.bind(this, 'home')}
        ></calcite-action>
        <calcite-action
          icon="graph-time-series"
          scale="s"
          slot="header-menu-actions"
          text="Daily Plot"
          text-enabled=""
          onclick={this.openStationUrl.bind(this, 1)}
        ></calcite-action>
        <calcite-action
          icon="graph-time-series"
          scale="s"
          slot="header-menu-actions"
          text="7 Day Plot"
          text-enabled=""
          onclick={this.openStationUrl.bind(this, 7)}
        ></calcite-action>
        <calcite-action
          icon="explore"
          scale="s"
          slot="header-menu-actions"
          text="Declination"
          text-enabled=""
          onclick={this.showMagneticDeclination.bind(this)}
        ></calcite-action>

        {/* action bar */}
        <calcite-action-bar expand-disabled="" layout="horizontal" slot="action-bar">
          <calcite-action
            active={content === 'tides'}
            icon="graph-time-series"
            scale="s"
            text="Tides"
            text-enabled=""
            onclick={this.showContent.bind(this, 'tides')}
          ></calcite-action>
          <calcite-action
            active={content === 'sun'}
            icon="brightness"
            scale="s"
            text="Sun"
            text-enabled=""
            onclick={this.showContent.bind(this, 'sun')}
          ></calcite-action>
          <calcite-action
            active={content === 'moon'}
            icon="moon"
            scale="s"
            text="Moon"
            text-enabled=""
            onclick={this.showContent.bind(this, 'moon')}
          ></calcite-action>
        </calcite-action-bar>

        {/* tides table */}
        <calcite-table hidden={content !== 'tides'} striped scale="s" style="--calcite-table-border-color: none;">
          {tideTimeInfos
            .map((tideTimeInfo: TideTimeInfo): tsx.JSX.Element => {
              const { event, style, time, height } = tideTimeInfo;

              return (
                <calcite-table-row key={KEY++} style={style}>
                  <calcite-table-cell>{time}</calcite-table-cell>
                  <calcite-table-cell>{event}</calcite-table-cell>
                  <calcite-table-cell>{height}</calcite-table-cell>
                </calcite-table-row>
              );
            })
            .toArray()}
        </calcite-table>

        {/* sun */}
        <calcite-table hidden={content !== 'sun'} striped scale="s" style="--calcite-table-border-color: none;">
          {sunTimeInfos
            .map((sunTimeInfo: SunTimeInfo): tsx.JSX.Element => {
              const { altitude, bearing, event, time } = sunTimeInfo;

              return (
                <calcite-table-row key={KEY++}>
                  <calcite-table-cell>{time}</calcite-table-cell>
                  <calcite-table-cell>{event}</calcite-table-cell>
                  <calcite-table-cell>{bearing}</calcite-table-cell>
                  <calcite-table-cell>{altitude}</calcite-table-cell>
                </calcite-table-row>
              );
            })
            .toArray()}
        </calcite-table>

        {/* moon */}

        <div hidden={content !== 'moon'}>
          <div afterCreate={this.moonInfoAfterCreate.bind(this)}></div>
        </div>

        <calcite-table hidden={content !== 'moon'} striped scale="s" style="--calcite-table-border-color: none;">
          {moonTimeInfos
            .map((moonTimeInfo: MoonTimeInfo): tsx.JSX.Element => {
              const { altitude, bearing, event, time } = moonTimeInfo;

              return (
                <calcite-table-row key={KEY++}>
                  <calcite-table-cell>{time}</calcite-table-cell>
                  <calcite-table-cell>{event}</calcite-table-cell>
                  <calcite-table-cell>{bearing}</calcite-table-cell>
                  <calcite-table-cell>{altitude}</calcite-table-cell>
                </calcite-table-row>
              );
            })
            .toArray()}
        </calcite-table>

        <calcite-alert scale="s" slot="alerts" afterCreate={this.alertAfterCreate.bind(this)}>
          <div slot="message">Magnetic declination is {magneticDeclination}</div>
        </calcite-alert>
      </calcite-dialog>
    );
  }

  private alertAfterCreate(alert: HTMLCalciteAlertElement): void {
    this.magneticDeclinationAlert = alert;
  }

  private moonInfoAfterCreate(container: HTMLDivElement): void {
    this.moonInfo.container = container;
  }

  //#endregion
}
