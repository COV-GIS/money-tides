//#region types

import type { __MT as MT } from '../interfaces';

//#endregion

//#region components

import '@esri/calcite-components/dist/components/calcite-action';
import '@esri/calcite-components/dist/components/calcite-alert';
import '@esri/calcite-components/dist/components/calcite-dialog';
import '@esri/calcite-components/dist/components/calcite-table';
import '@esri/calcite-components/dist/components/calcite-table-cell';
import '@esri/calcite-components/dist/components/calcite-table-row';

//#endregion

//#region modules

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import createURL from '../utils/createURL';
import DateTime, { NOAADate } from '../utils/dateAndTimeUtils';
import { moneyTypeColorHex } from '../utils/colorUtils';
import { magneticDeclination } from '../utils/sunAndMoonUtils';

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
      this.magneticDeclinationAlert.open = false;
    });
  }

  //#endregion

  //#region public properties

  public station!: MT.Station;

  //#endregion

  //#region private properties

  @property()
  private showSunAndMoon = false;

  @property()
  private magneticDeclination = '';

  private magneticDeclinationAlert!: HTMLCalciteAlertElement;

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

  //#endregion

  //#region render

  render(): tsx.JSX.Element {
    const { station } = this;

    if (!station) return <calcite-dialog></calcite-dialog>;

    const { magneticDeclination, showSunAndMoon } = this;

    const { date, name, tides } = station;

    return (
      <calcite-dialog
        heading={`${name} - ${date.toLocaleString(DateTime.DATE_FULL)}`}
        placement="bottom-start"
        scale="s"
        style={`--calcite-dialog-min-size-y: 0; --calcite-dialog-max-size-x: ${
          showSunAndMoon ? '420' : '330'
        }px; --calcite-dialog-content-space: 0;`}
        width="s"
      >
        {/* header menu actions */}
        <calcite-action
          icon={showSunAndMoon ? 'view-hide' : 'view-visible'}
          scale="s"
          slot="header-menu-actions"
          text="Solor/Lunar Positions"
          text-enabled=""
          onclick={(): void => {
            this.showSunAndMoon = !this.showSunAndMoon;
          }}
        ></calcite-action>
        <calcite-action
          icon="explore"
          scale="s"
          slot="header-menu-actions"
          text="Magnetic Declination"
          text-enabled=""
          onclick={this.showMagneticDeclination.bind(this)}
        ></calcite-action>
        <calcite-action
          icon="home"
          scale="s"
          slot="header-menu-actions"
          text="NOAA Home"
          text-enabled=""
          onclick={this.openStationUrl.bind(this, 'home')}
        ></calcite-action>
        <calcite-action
          icon="graph-time-series"
          scale="s"
          slot="header-menu-actions"
          text="NOAA Daily Plot"
          text-enabled=""
          onclick={this.openStationUrl.bind(this, 1)}
        ></calcite-action>
        <calcite-action
          icon="graph-time-series"
          scale="s"
          slot="header-menu-actions"
          text="NOAA 7 Day Plot"
          text-enabled=""
          onclick={this.openStationUrl.bind(this, 7)}
        ></calcite-action>

        {/* tides table */}
        <calcite-table striped scale="s" style="--calcite-table-border-color: none;">
          <calcite-table-row slot="table-header">
            <calcite-table-header heading="Time"></calcite-table-header>
            <calcite-table-header heading="Tide event"></calcite-table-header>
            <calcite-table-header heading="Tide height"></calcite-table-header>
            {showSunAndMoon
              ? [
                  <calcite-table-header heading="Solar position" key={KEY++}></calcite-table-header>,
                  <calcite-table-header heading="Lunar position" key={KEY++}></calcite-table-header>,
                ]
              : null}
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
                  <calcite-table-cell>{time}</calcite-table-cell>
                  <calcite-table-cell>{type}</calcite-table-cell>
                  <calcite-table-cell>{heightLabel}</calcite-table-cell>
                  {showSunAndMoon
                    ? [
                        <calcite-table-cell key={KEY++}>
                          {sunPosition.aboveHorizon ? `${sunPosition.bearing} @ ${sunPosition.altitude}` : 'n/a'}
                        </calcite-table-cell>,
                        <calcite-table-cell key={KEY++}>
                          {moonPosition.aboveHorizon ? `${moonPosition.bearing} @ ${moonPosition.altitude}` : 'n/a'}
                        </calcite-table-cell>,
                      ]
                    : null}
                </calcite-table-row>
              );
            })}
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

  //#endregion
}
