//#region types

import type { MoneyType, Prediction, Station } from '../typings';

//#endregion

//#region components

import '@esri/calcite-components/dist/components/calcite-action';
import '@esri/calcite-components/dist/components/calcite-action-group';
import '@esri/calcite-components/dist/components/calcite-dialog';
import '@esri/calcite-components/dist/components/calcite-table';
import '@esri/calcite-components/dist/components/calcite-table-row';

//#endregion

//#region modules

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { DateTime } from 'luxon';

import { createURL, formatNOAADate, twelveHourTime } from './MoneyTides';

// import { stationHome, stationPredictions } from '../support';

//#endregion

//#region constants

const CSS_BASE = 'tides-dialog';

const CSS = {
  table: `${CSS_BASE}_table`,
};

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

  @property()
  private content: 'tides' | 'sun' | 'moon' = 'tides';

  //#region public methods

  close(): void {
    this.container.open = false;
  }

  show(station: Station): void {
    this.station = station;

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
    const { content, station } = this;

    if (!station) return <calcite-dialog></calcite-dialog>;

    const { date, name, predictions, sunTimes } = station;

    const heading = `${name} - ${date.toLocaleString(DateTime.DATE_FULL)}`;

    return (
      <calcite-dialog class={CSS_BASE} heading={heading} placement="bottom-start" width="s">
        {/* header menu actions */}
        <calcite-action
          slot="header-menu-actions"
          text="Home"
          text-enabled=""
          onclick={this.openStationUrl.bind(this, 'home')}
        ></calcite-action>
        <calcite-action
          slot="header-menu-actions"
          text="Daily Plot"
          text-enabled=""
          onclick={this.openStationUrl.bind(this, 1)}
        ></calcite-action>
        <calcite-action
          slot="header-menu-actions"
          text="7 Day Plot"
          text-enabled=""
          onclick={this.openStationUrl.bind(this, 7)}
        ></calcite-action>

        <calcite-action-bar expand-disabled="horizontal" layout="" slot="action-bar">
          <calcite-action
            active={content === 'tides'}
            text="Tides"
            text-enabled=""
            onclick={(): void => {
              this.content = 'tides';
            }}
          ></calcite-action>
          <calcite-action
            active={content === 'sun'}
            text="Sun"
            text-enabled=""
            onclick={(): void => {
              this.content = 'sun';
            }}
          ></calcite-action>
          <calcite-action
            active={content === 'moon'}
            text="Moon"
            text-enabled=""
            onclick={(): void => {
              this.content = 'moon';
            }}
          ></calcite-action>
        </calcite-action-bar>

        {/* tides table */}
        <calcite-table class={CSS.table} hidden={content !== 'tides'} striped>
          {predictions.map((prediction: Prediction): tsx.JSX.Element => {
            const { height, moneyType, tideType, time } = prediction;

            const isMoney = moneyType !== 'not-money';

            return (
              <calcite-table-row key={KEY++} class={moneyType}>
                <calcite-table-cell>{this.tideCellContent(time, isMoney, moneyType)}</calcite-table-cell>
                <calcite-table-cell>
                  {this.tideCellContent(
                    tideType === 'high' && time === '12:00 PM' ? 'high/noon' : tideType,
                    isMoney,
                    moneyType,
                  )}
                </calcite-table-cell>
                <calcite-table-cell>{this.tideCellContent(height, isMoney, moneyType)}</calcite-table-cell>
              </calcite-table-row>
            );
          })}
        </calcite-table>

        {/* sun table */}
        <calcite-table class={CSS.table} hidden={content !== 'sun'} striped>
          <calcite-table-row>
            <calcite-table-cell>Dawn</calcite-table-cell>
            <calcite-table-cell>{twelveHourTime(sunTimes.dawn)}</calcite-table-cell>
          </calcite-table-row>

          <calcite-table-row>
            <calcite-table-cell>Sunrise</calcite-table-cell>
            <calcite-table-cell>{twelveHourTime(sunTimes.sunrise)}</calcite-table-cell>
          </calcite-table-row>

          <calcite-table-row>
            <calcite-table-cell>Solar noon</calcite-table-cell>
            <calcite-table-cell>{twelveHourTime(sunTimes.solarNoon)}</calcite-table-cell>
          </calcite-table-row>

          <calcite-table-row>
            <calcite-table-cell>Sunset</calcite-table-cell>
            <calcite-table-cell>{twelveHourTime(sunTimes.sunset)}</calcite-table-cell>
          </calcite-table-row>

          <calcite-table-row>
            <calcite-table-cell>Dusk</calcite-table-cell>
            <calcite-table-cell>{twelveHourTime(sunTimes.dusk)}</calcite-table-cell>
          </calcite-table-row>
        </calcite-table>
      </calcite-dialog>
    );
  }

  private tideCellContent(value: number | string, isMoney: boolean, money: MoneyType): string | tsx.JSX.Element {
    value = typeof value === 'number' ? `${value} ft` : value;

    if (!isMoney) return value;

    return <span class={money}>{value}</span>;
  }

  //#endregion
}
