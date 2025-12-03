//#region types

import type { Prediction, Station } from './typings';

//#endregion

//#region components

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

//#endregion

//#region constants

const CSS_BASE = 'tides-dialog';

const CSS = {
  base: CSS_BASE,
  table: `${CSS_BASE}_table`,
};

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

  //#region render

  render(): tsx.JSX.Element {
    const { station } = this;

    if (!station) return <calcite-dialog></calcite-dialog>;

    const { dateIso, dateNoaa, id, money, name, predictions } = station;

    const heading = `${name} - ${DateTime.fromISO(dateIso).toLocaleString(DateTime.DATE_FULL)}`;

    const kind = money === 0 ? 'danger' : money === 1 ? 'warning' : 'success';

    return (
      <calcite-dialog class={CSS.base} heading={heading} kind={kind} placement="bottom-start" width="s">
        <calcite-table class={CSS.table} striped>
          {predictions.map((prediction: Prediction): tsx.JSX.Element => {
            const { height, time, type } = prediction;

            return (
              <calcite-table-row>
                <calcite-table-cell>{time}</calcite-table-cell>
                <calcite-table-cell>{type}</calcite-table-cell>
                <calcite-table-cell>{height} ft</calcite-table-cell>
              </calcite-table-row>
            );
          })}
        </calcite-table>
        <calcite-link
          href={`https://tidesandcurrents.noaa.gov/stationhome.html?id=${id}`}
          slot="footer-end"
          target="_blank"
        >
          Station Home
        </calcite-link>
        <calcite-link
          href={`https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=${id}&units=standard&bdate=${dateNoaa}&edate=${dateNoaa}&timezone=LST/LDT&clock=12hour&datum=MLLW&interval=hilo&action=dailychart`}
          slot="footer-end"
          target="_blank"
        >
          Station Tides
        </calcite-link>
      </calcite-dialog>
    );
  }

  //#endregion
}
