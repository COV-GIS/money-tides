//#region types

import type { __MT as MT } from '../interfaces';

//#endregion

//#region components

import '@esri/calcite-components/dist/components/calcite-dialog';

//#endregion

//#region modules

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import DateTime from '../utils/dateAndTimeUtils';

import Chart from 'chart.js/auto';

//#endregion

@subclass('PlotModal')
export default class PlotModal extends Widget {
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
  public station?: MT.Station;

  //#endregion

  //#region public methods

  public open() {
    this.container.open = true;
  }

  //#endregion

  private testChart(): tsx.JSX.Element {
    return (
      <canvas
        afterCreate={(canvas: HTMLCanvasElement): void => {
          if (!this.station) return;

          const { tides } = this.station;

          const data = [
            { year: 2010, count: 10 },
            { year: 2011, count: 20 },
            { year: 2012, count: 15 },
            { year: 2013, count: 25 },
            { year: 2014, count: 22 },
            { year: 2015, count: 30 },
            { year: 2016, count: 28 },
          ];

          const labels = [];

          new Chart(canvas, {
            type: 'line',
            options: { responsive: true },
            data: {
              labels: data.map((row) => row.year),
              datasets: [
                {
                  label: 'Acquisitions by year',
                  data: data.map((row) => row.count),
                },
              ],
            },
          });
        }}
      ></canvas>
    );
  }

  //#region render

  render(): tsx.JSX.Element {
    if (!this.station) return <calcite-dialog></calcite-dialog>;

    const { date, name } = this.station;

    return (
      <calcite-dialog heading={`${name} - ${date.toLocaleString(DateTime.DATE_FULL)}`} modal scale="s">
        <div style="position: relative; width:100%; height:100%;">{this.testChart()}</div>
      </calcite-dialog>
    );
  }

  //#endregion
}
