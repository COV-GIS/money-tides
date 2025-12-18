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

import { setTime, twelveHourTime } from '../utils/dateAndTimeUtils';
import { radiansToDegrees } from '../utils/sunAndMoonUtils';

// import { polynomial } from 'regression';

import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(annotationPlugin);

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

          const labels: number[] = [
            setTime(this.station.date.minus({ day: 1 }), { hour: 12 }).toMillis(),
            setTime(this.station.date.minus({ day: 1 }), { hour: 18 }).toMillis(),
            setTime(this.station.date, { hour: 0 }).toMillis(),
            setTime(this.station.date, { hour: 6 }).toMillis(),
            setTime(this.station.date, { hour: 12 }).toMillis(),
            setTime(this.station.date, { hour: 18 }).toMillis(),
            setTime(this.station.date, { hour: 24 }).toMillis(),
            setTime(this.station.date.plus({ day: 1 }), { hour: 6 }).toMillis(),
            setTime(this.station.date.plus({ day: 1 }), { hour: 12 }).toMillis(),
          ];

          const tideData: { x: number; y: number }[] = tides
            .filter((tide: MT.Tide): boolean => {
              return tide.isPrediction;
            })
            .map((tide: MT.Tide): { x: number; y: number } => {
              return { x: tide.date.toMillis(), y: tide.height };
            });

          const solarData: { x: number; y: number }[] = tides
            .filter((tide: MT.Tide): boolean => {
              return tide.isSolar;
            })
            .map((tide: MT.Tide): { x: number; y: number } => {
              return { x: tide.date.toMillis(), y: radiansToDegrees(tide.sunPosition.position.altitude) };
            });

            const lunarData: { x: number; y: number }[] = tides
            .filter((tide: MT.Tide): boolean => {
              return tide.isLunar;
            })
            .map((tide: MT.Tide): { x: number; y: number } => {
              return { x: tide.date.toMillis(), y: radiansToDegrees(tide.moonPosition.position.altitude) };
            });

          new Chart(canvas, {
            type: 'line',
            data: {
              labels,
              datasets: [
                {
                  yAxisID: 'tides',
                  // label: 'height',
                  data: tideData,
                  cubicInterpolationMode: 'monotone',
                },
                {
                  yAxisID: 'solar-lunar',
                  // label: 'altitude',
                  data: solarData,
                  cubicInterpolationMode: 'monotone',
                },
                {
                  yAxisID: 'solar-lunar',
                  // label: 'altitude',
                  data: lunarData,
                  cubicInterpolationMode: 'monotone',
                },
              ],
            },
            options: {
              scales: {
                x: {
                  type: 'linear',
                  min: labels[0],
                  max: labels[labels.length - 1],
                  ticks: {
                    count: labels.length,
                    callback: (tickValue): any => {
                      return twelveHourTime(DateTime.fromMillis(tickValue as number));
                    },
                  },
                },
                tides: {
                  position: 'left',
                  title: {
                    display: true,
                    text: 'Height in feet (MLLW)',
                  },
                },
                'solar-lunar': {
                  position: 'right',
                  min: 0,
                  max: 70,
                  grid: {
                    drawOnChartArea: false,
                  },
                },
              },
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    title: (tooltipItems): string => {
                      return DateTime.fromMillis(tooltipItems[0].parsed.x as number).toLocaleString(
                        DateTime.DATETIME_MED,
                      );
                    },
                    label: (tooltipItem): string => {
                      return `${tooltipItem.formattedValue} ft`;
                    },
                  },
                },
                annotation: {
                  annotations: {
                    yesterday: {
                      type: 'box',
                      xMin: labels[0],
                      xMax: labels[2],
                      // yMin: -100,
                      // yMax: 100,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      borderWidth: 0,
                    },
                    tomorrow: {
                      type: 'box',
                      xMin: labels[6],
                      xMax: labels[8],
                      // yMin: -100,
                      // yMax: 100,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      borderWidth: 0,
                    },
                  },
                },
              },
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
        <div style="width:100%; height:100%;">{this.testChart()}</div>
      </calcite-dialog>
    );
  }

  //#endregion
}
