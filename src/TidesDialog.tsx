//#region types

import type { Prediction, Station } from './typings';

//#endregion

//#region components

import '@esri/calcite-components/dist/components/calcite-action';
import '@esri/calcite-components/dist/components/calcite-action-group';
import '@esri/calcite-components/dist/components/calcite-dialog';
import '@esri/calcite-components/dist/components/calcite-link';
import '@esri/calcite-components/dist/components/calcite-table';
import '@esri/calcite-components/dist/components/calcite-table-row';

//#endregion

//#region modules

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { DateTime } from 'luxon';
import { NOAA_DATE } from './MoneyTides';

//#endregion

//#region constants

const CSS_BASE = 'tides-dialog';

const CSS = {
  base: CSS_BASE,
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

  public station!: Station;

  //#endregion

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

  private openUrl(type: 'home' | 1 | 7 | 30): void {
    const { id, dateIso, dateNoaa } = this.station;

    if (type === 'home') {
      window.open(`https://tidesandcurrents.noaa.gov/stationhome.html?id=${id}`, '_blank');
    } else if (type === 1) {
      window.open(
        `https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=${id}&units=standard&bdate=${dateNoaa}&edate=${dateNoaa}&timezone=LST/LDT&clock=12hour&datum=MLLW&interval=hilo&action=dailychart`,
        '_blank',
      );
    } else {
      window.open(
        `https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=${id}&units=standard&bdate=${dateNoaa}&edate=${NOAA_DATE(
          DateTime.fromISO(dateIso).set({ day: type }),
        )}&timezone=LST/LDT&clock=12hour&datum=MLLW&interval=hilo&action=dailychart`,
        '_blank',
      );
    }
  }

  //#endregion

  //#region render

  render(): tsx.JSX.Element {
    const { station } = this;

    if (!station) return <calcite-dialog></calcite-dialog>;

    const { dateIso, name, predictions } = station;

    const heading = `${name} - ${DateTime.fromISO(dateIso).toLocaleString(DateTime.DATE_FULL)}`;

    return (
      <calcite-dialog class={CSS.base} heading={heading} placement="bottom-start" width="s">
        {/* actions */}
        <calcite-action-bar expand-disabled="horizontal" layout="" scale="s" slot="action-bar">
          <calcite-action
            scale="s"
            text="Home"
            text-enabled=""
            onclick={this.openUrl.bind(this, 'home')}
          ></calcite-action>
          <calcite-action
            scale="s"
            text="Daily Plot"
            text-enabled=""
            onclick={this.openUrl.bind(this, 1)}
          ></calcite-action>
          <calcite-action
            scale="s"
            text="7 Day Plot"
            text-enabled=""
            onclick={this.openUrl.bind(this, 7)}
          ></calcite-action>
          <calcite-action
            scale="s"
            text="30 Day Plot"
            text-enabled=""
            onclick={this.openUrl.bind(this, 30)}
          ></calcite-action>
        </calcite-action-bar>

        {/* prediction table */}
        <calcite-table class={CSS.table} striped>
          {predictions.map((prediction: Prediction): tsx.JSX.Element => {
            const { height, money, moneyType, time, type } = prediction;

            return (
              <calcite-table-row key={KEY++} class={moneyType}>
                <calcite-table-cell>{this.cellContent(time, money, moneyType)}</calcite-table-cell>
                <calcite-table-cell>{this.cellContent(type, money, moneyType)}</calcite-table-cell>
                <calcite-table-cell>{this.cellContent(height, money, moneyType)}</calcite-table-cell>
              </calcite-table-row>
            );
          })}
        </calcite-table>
      </calcite-dialog>
    );
  }

  private cellContent(
    value: number | string,
    money: Prediction['money'],
    moneyType: Prediction['moneyType'],
  ): string | tsx.JSX.Element {
    value = typeof value === 'number' ? `${value} ft` : value;

    if (!money) return value;

    return <span class={moneyType}>{value}</span>;
  }

  //#endregion
}
