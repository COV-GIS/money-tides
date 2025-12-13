//#region types

import esri = __esri;

import type { Prediction, Station, SunTimeInfo, TideTimeInfo } from '../typings';

//#endregion

//#region components

import '@esri/calcite-components/dist/components/calcite-action';
import '@esri/calcite-components/dist/components/calcite-action-group';
import '@esri/calcite-components/dist/components/calcite-dialog';
import '@esri/calcite-components/dist/components/calcite-notice';
import '@esri/calcite-components/dist/components/calcite-table';
import '@esri/calcite-components/dist/components/calcite-table-row';

//#endregion

//#region modules

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import createURL from '../utils/createURL';
import DateTime, { NOAADate, twelveHourTime } from '../utils/dateAndTimeUtils';
import { moneyTypeColorHex } from '../utils/colorUtils';
import { altitudeToDegrees, azimuthToBearing, sunPosition } from '../utils/sunAndMoonUtils';
import { tideHeightAtTime } from '../utils/tideUtils';

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
    });
  }

  //#endregion

  //#region public properties

  public station!: Station;

  //#endregion

  //#region private properties

  @property()
  private content: 'tides' | 'sun' | 'moon' = 'tides';

  private sunTimeInfos: esri.Collection<SunTimeInfo> = new Collection();

  private tideTimeInfos: esri.Collection<TideTimeInfo> = new Collection();

  //#endregion

  //#region public methods

  close(): void {
    this.container.open = false;
  }

  open(station: Station): void {
    this.station = station;

    this.tideTimes(station);

    this.sunTimes(station);

    this.renderNow();

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

  private tideTimes(station: Station): void {
    const {
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
        time: twelveHourTime(solarNoon),
        height: `${tideHeightAtTime(tides, DateTime.fromJSDate(solarNoon))} ft`,
      },
      {
        date: DateTime.fromJSDate(sunrise),
        event: 'sunrise',
        time: twelveHourTime(sunrise),
        height: `${tideHeightAtTime(tides, DateTime.fromJSDate(sunrise))} ft`,
      },
      {
        date: DateTime.fromJSDate(sunset),
        event: 'sunset',
        time: twelveHourTime(sunset),
        height: `${tideHeightAtTime(tides, DateTime.fromJSDate(sunset))} ft`,
      },
    ]);

    tideTimeInfos.sort((a: TideTimeInfo, b: TideTimeInfo): number => {
      return a.date.toMillis() - b.date.toMillis();
    });

    this.tideTimeInfos = tideTimeInfos;
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

  //#endregion

  //#region render

  render(): tsx.JSX.Element {
    const { content, station, tideTimeInfos, sunTimeInfos } = this;

    if (!station) return <calcite-dialog></calcite-dialog>;

    const { date, name } = station;

    const heading = `${name} - ${date.toLocaleString(DateTime.DATE_FULL)}`;

    return (
      <calcite-dialog
        heading={heading}
        placement="bottom-start"
        scale="s"
        style={`--calcite-dialog-min-size-y: 0; --calcite-dialog-max-size-x: 420px; ${
          content !== 'moon' ? '--calcite-dialog-content-space: 0;' : ''
        }`}
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

        {/* action bar */}
        <calcite-action-bar expand-disabled="" layout="horizontal" slot="action-bar">
          <calcite-action
            active={content === 'tides'}
            icon="graph-time-series"
            scale="s"
            text="Tides"
            text-enabled=""
            onclick={(): void => {
              this.content = 'tides';
            }}
          ></calcite-action>
          <calcite-action
            active={content === 'sun'}
            icon="brightness"
            scale="s"
            text="Sun"
            text-enabled=""
            onclick={(): void => {
              this.content = 'sun';
            }}
          ></calcite-action>
          <calcite-action
            active={content === 'moon'}
            icon="moon"
            scale="s"
            text="Moon"
            text-enabled=""
            onclick={(): void => {
              this.content = 'moon';
            }}
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
        {/* <div hidden={content !== 'sun'}>
          <calcite-notice icon="brightness" open scale="s">
            <div slot="title">Coming soon</div>
            <div slot="message">Information about the position of the sun at high and low tides</div>
          </calcite-notice>
        </div> */}
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
          <calcite-notice icon="moon" open scale="s">
            <div slot="title">Coming soon</div>
            <div slot="message">Information about the phase of the moon and its position at high and low tides</div>
          </calcite-notice>
        </div>
      </calcite-dialog>
    );
  }

  //#endregion
}
