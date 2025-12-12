//#region types

import esri = __esri;

import type { Prediction, Station, TideTimeInfo, TideSunAndMoonPositionInfo } from '../typings';

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
import { DateTime } from 'luxon';
import createURL from '../utils/createURL';
import { NOAADate, twelveHourTime } from '../utils/dateAndTimeUtils';
import { moneyTypeColorHex } from '../utils/colorUtils';
import { sunAndMoonPosition } from '../utils/sunAndMoonUtils';
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

  private tideTimeInfos: esri.Collection<TideTimeInfo> = new Collection();

  private tideSunAndMoonPositions: esri.Collection<TideSunAndMoonPositionInfo> = new Collection();

  //#endregion

  //#region public methods

  close(): void {
    this.container.open = false;
  }

  open(station: Station): void {
    this.station = station;

    this.tideTimes(station);

    const {
      predictions,
      sunTimes: { solarNoon, sunrise, sunset },
      latitude,
      longitude,
    } = station;

    // const tideSunAndMoonPositions = new Collection();

    const tideSunAndMoonPositions = new Collection();

    predictions.forEach((prediction: Prediction): void => {
      const {
        sunPosition: { altitude, azimuth },
      } = sunAndMoonPosition(prediction.date, latitude, longitude);

      tideSunAndMoonPositions.add({
        ...prediction,
        ...sunAndMoonPosition(prediction.date, latitude, longitude),
      });
    });

    // @ts-ignore
    console.log(tideSunAndMoonPositions.items);

    this.tideSunAndMoonPositions = tideSunAndMoonPositions;

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
        height: `${tideHeightAtTime(predictions, DateTime.fromJSDate(solarNoon))} ft`,
      },
      {
        date: DateTime.fromJSDate(sunrise),
        event: 'sunrise',
        time: twelveHourTime(sunrise),
        height: `${tideHeightAtTime(predictions, DateTime.fromJSDate(sunrise))} ft`,
      },
      {
        date: DateTime.fromJSDate(sunset),
        event: 'sunset',
        time: twelveHourTime(sunset),
        height: `${tideHeightAtTime(predictions, DateTime.fromJSDate(sunset))} ft`,
      },
    ]);

    tideTimeInfos.sort((a: TideTimeInfo, b: TideTimeInfo): number => {
      return a.date.toMillis() - b.date.toMillis();
    });

    this.tideTimeInfos = tideTimeInfos;
  }

  //#endregion

  //#region render

  render(): tsx.JSX.Element {
    const { content, station, tideTimeInfos, tideSunAndMoonPositions } = this;

    if (!station) return <calcite-dialog></calcite-dialog>;

    const { date, name, sunTimes } = station;

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
          {tideSunAndMoonPositions
            .map((tideSunAndMoonPosition: TideSunAndMoonPositionInfo): tsx.JSX.Element => {
              const {
                date,
                moonPosition,
                sunPosition: { altitude, azimuth },
                tideType,
                time,
              } = tideSunAndMoonPosition;

              const azimuthAngle = Number(((azimuth * 180) / Math.PI).toFixed(0));

              const bearing =
                azimuthAngle === 0
                  ? 'South'
                  : azimuthAngle > 0
                  ? `S ${azimuthAngle}° W`
                  : `S ${Math.abs(azimuthAngle)}° E`;

              return (
                <calcite-table-row key={KEY++}>
                  <calcite-table-cell>{time}</calcite-table-cell>
                  <calcite-table-cell>{tideType} tide</calcite-table-cell>
                  <calcite-table-cell>{altitude < 0 ? '-' : bearing}</calcite-table-cell>
                  <calcite-table-cell>
                    {altitude < 0 ? '-' : `${((altitude * 180) / Math.PI).toFixed(0)}°`}
                  </calcite-table-cell>
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
