//#region types

import type { MT } from '../interfaces';

//#endregion

//#region modules

import './TidesDialog.scss';

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import createURL from '../utils/createURL';
import DateTime, { NOAADate } from '../utils/dateAndTimeUtils';
import { moneyTypeColorHex } from '../utils/colorUtils';

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

  //#endregion

  //#region public properties

  @property()
  public station!: MT.Station;

  //#endregion

  //#region public methods

  close(): void {
    this.container.open = false;
  }

  open(station: MT.Station): void {
    this.station = station;

    this.renderNow();

    this.container.open = true;
  }

  //#endregion

  //#region private methods

  private openNOAA(): void {
    const { date, id } = this.station;

    const noaaDate = NOAADate(date);

    window.open(
      createURL('https://tidesandcurrents.noaa.gov/noaatidepredictions.html', {
        action: 'dailychart',
        bdate: noaaDate,
        clock: 12,
        datum: 'MLLW',
        edate: noaaDate,
        id,
        interval: 'hilo',
        timezone: 'LST/LDT',
        units: 'standard',
      }),
      '_blank',
    );
  }

  private openWeather(): void {
    window.open(`https://www.wunderground.com/weather/${this.station.weather}`, '_blank');
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    const { station } = this;

    if (!station) return <calcite-dialog></calcite-dialog>;

    const { date, name, tides } = station;

    return (
      <calcite-dialog
        class={CSS_BASE}
        heading={`${name} - ${date.toLocaleString(DateTime.DATE_FULL)}`}
        placement="bottom-start"
        scale="s"
        width="s"
      >
        {/* header menu */}
        <calcite-action
          icon="graph-time-series"
          scale="s"
          slot="header-menu-actions"
          text="Tides Plot"
          text-enabled=""
          onclick={(): void => {
            this.emit('plot-tides', this.station);
          }}
        ></calcite-action>
        <calcite-action
          icon="partly-cloudy"
          scale="s"
          slot="header-menu-actions"
          text="Local Weather"
          text-enabled=""
          onclick={this.openWeather.bind(this)}
        ></calcite-action>
        <calcite-action
          icon="home"
          scale="s"
          slot="header-menu-actions"
          text="NOAA Station"
          text-enabled=""
          onclick={this.openNOAA.bind(this)}
        ></calcite-action>

        {/* tides table */}
        <calcite-table class={CSS.table} scale="s" striped>
          <calcite-table-row slot="table-header">
            <calcite-table-header alignment="center" heading="Time"></calcite-table-header>
            <calcite-table-header alignment="center" heading="Event"></calcite-table-header>
            <calcite-table-header alignment="center" heading="Height"></calcite-table-header>
            <calcite-table-header alignment="center" heading="Sun Position"></calcite-table-header>
            <calcite-table-header alignment="center" heading="Moon Position"></calcite-table-header>
          </calcite-table-row>
          {tides
            .filter((tide: MT.Tide): boolean => {
              return tide.isDate;
            })
            .map((tide: MT.Tide): tsx.JSX.Element => {
              const { heightLabel, isPrediction, money, moonPosition, sunPosition, time, type } = tide;

              const style = [
                // money color
                money !== 'not-money' ? `--calcite-table-row-background-color: ${moneyTypeColorHex(money)};` : '',
                // `money` money text color
                money === 'money' ? '--calcite-table-cell-text-color: #ffffff;' : '',
                // predictions
                isPrediction ? 'font-weight: var(--calcite-font-weight-medium);' : '',
              ].join(' ');

              return (
                <calcite-table-row key={KEY++} style={style}>
                  <calcite-table-cell alignment="center">{time}</calcite-table-cell>
                  <calcite-table-cell alignment="center">{type}</calcite-table-cell>
                  <calcite-table-cell alignment="center">{heightLabel}</calcite-table-cell>
                  <calcite-table-cell alignment="center">
                    {sunPosition.aboveHorizon
                      ? `${sunPosition.azimuthBearing} ${
                          sunPosition.altitudeDegrees === '0°' ? '' : `@ ${sunPosition.altitudeDegrees}`
                        }`
                      : '-'}
                  </calcite-table-cell>
                  <calcite-table-cell alignment="center">
                    {moonPosition.aboveHorizon
                      ? `${moonPosition.azimuthBearing} ${
                          moonPosition.altitudeDegrees === '0°' ? '' : `@ ${moonPosition.altitudeDegrees}`
                        }`
                      : '-'}
                  </calcite-table-cell>
                </calcite-table-row>
              );
            })}
        </calcite-table>
      </calcite-dialog>
    );
  }

  //#endregion
}
