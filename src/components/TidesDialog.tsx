//#region types

import esri = __esri;

import type { Prediction, Station, TimeInfo } from '../typings';

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
import { createURL, formatNOAADate, twelveHourTime } from './MoneyTides';
import { moneyTypeColorHex } from './colorUtils';

// import { stationHome, stationPredictions } from '../support';

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

  private timeInfos: esri.Collection<TimeInfo> = new Collection();

  //#endregion

  //#region public methods

  close(): void {
    this.container.open = false;
  }

  show(station: Station): void {
    this.station = station;

    const {
      // moonTimes: { rise: moonrise, set: moonset },
      predictions,
      // sunTimes: { dawn, dusk, solarNoon, sunrise, sunset },
      sunTimes: { solarNoon, sunrise, sunset },
    } = station;

    const timeInfos: esri.Collection<TimeInfo> = new Collection(
      predictions.map((prediction: Prediction): TimeInfo => {
        const { date, height, moneyType, tideType, time } = prediction;

        return {
          date,
          description: `${tideType} tide`,
          style: [
            moneyType !== 'not-money'
              ? `--calcite-table-row-background-color: ${moneyTypeColorHex(
                  moneyType,
                )}; font-weight: var(--calcite-font-weight-medium);`
              : '',
            moneyType === 'money' ? '--calcite-table-cell-text-color: #ffffff' : '',
          ].join(' '),
          time,
          value: `${height} ft`,
        };
      }),
    );

    timeInfos.addMany([
      // {
      //   date: DateTime.fromJSDate(dawn),
      //   description: 'dawn',
      //   time: twelveHourTime(dawn),
      // },
      // {
      //   date: DateTime.fromJSDate(dusk),
      //   description: 'dusk',
      //   time: twelveHourTime(dusk),
      // },
      {
        date: DateTime.fromJSDate(solarNoon),
        description: 'solar noon',
        time: twelveHourTime(solarNoon),
      },
      {
        date: DateTime.fromJSDate(sunrise),
        description: 'sunrise',
        time: twelveHourTime(sunrise),
      },
      {
        date: DateTime.fromJSDate(sunset),
        description: 'sunset',
        time: twelveHourTime(sunset),
      },
    ]);

    // if (moonrise)
    //   timeInfos.add({
    //     date: DateTime.fromJSDate(moonrise),
    //     description: 'moonrise',
    //     time: twelveHourTime(moonrise),
    //   });

    // if (moonset)
    //   timeInfos.add({
    //     date: DateTime.fromJSDate(moonset),
    //     description: 'moonset',
    //     time: twelveHourTime(moonset),
    //   });

    timeInfos.sort((a: TimeInfo, b: TimeInfo): number => {
      return a.date.toMillis() - b.date.toMillis();
    });

    this.timeInfos = timeInfos;

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

    const end = type === 1 ? start : start.plus({ days: type - 1 });

    window.open(
      createURL('https://tidesandcurrents.noaa.gov/noaatidepredictions.html', {
        action: 'dailychart',
        bdate: formatNOAADate(start),
        clock: 12,
        datum: 'MLLW',
        edate: formatNOAADate(end),
        id,
        interval: 'hilo',
        timezone: 'LST/LDT',
        units: 'standard',
      }),
      '_blank',
    );
  }

  //#endregion

  //#region render

  render(): tsx.JSX.Element {
    const { content, station, timeInfos } = this;

    if (!station) return <calcite-dialog></calcite-dialog>;

    const { date, name } = station;

    const heading = `${name} - ${date.toLocaleString(DateTime.DATE_FULL)}`;

    return (
      <calcite-dialog
        heading={heading}
        placement="bottom-start"
        scale="s"
        style={`--calcite-dialog-min-size-y: 0; --calcite-dialog-max-size-x: 420px; ${
          content === 'tides' ? '--calcite-dialog-content-space: 0;' : ''
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
          {timeInfos
            .map((timeInfo: TimeInfo): tsx.JSX.Element => {
              const { description, style, time, value } = timeInfo;

              return (
                <calcite-table-row key={KEY++} style={style}>
                  <calcite-table-cell>{time}</calcite-table-cell>
                  <calcite-table-cell>{description}</calcite-table-cell>
                  <calcite-table-cell>{value}</calcite-table-cell>
                </calcite-table-row>
              );
            })
            .toArray()}
        </calcite-table>

        {/* sun */}
        <div hidden={content !== 'sun'}>
          <calcite-notice icon="brightness" open scale="s">
            <div slot="title">Coming soon</div>
            <div slot="message">Information about the position of the sun at high and low tides</div>
          </calcite-notice>
        </div>

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
