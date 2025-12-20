//#region types

import type { MT } from '../interfaces';
import type { Context as DataLabelsContext } from 'chartjs-plugin-datalabels';
type ChartDataValue = { x: number; y: number; tide: MT.Tide };

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
import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(annotationPlugin);
Chart.register(ChartDataLabels);

//#endregion

//#region constants

const COLORS = {
  moon: 'rgba(74, 74, 74, 0.25)',
  sun: 'rgba(248, 153, 39, 0.25)',
  tide: '#00619b',
  time: '#35ac46',
  transparent: 'rgba(0, 0, 0, 0)',
};

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

  //#region public methods

  public open(station: MT.Station): void {
    this.station = station;

    this.container.open = true;
  }

  //#endregion

  //#region private properties

  private chart: Chart | null = null;

  @property()
  private station: MT.Station | null = null;

  //#endregion

  //#region private methods

  private createChart(canvas: HTMLCanvasElement): void {
    if (!this.station) return;

    const { tides } = this.station;

    const altitideScales = [-90, -45, 0, 45, 90];

    const currentTime = DateTime.now().setZone('America/Los_Angeles').toMillis();

    let maxAltitude = 0;

    let minAltitude = 0;

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

    const tideData: ChartDataValue[] = tides
      .filter((tide: MT.Tide): boolean => {
        return tide.isPrediction;
      })
      .map((tide: MT.Tide): ChartDataValue => {
        return { x: tide.date.toMillis(), y: tide.height, tide };
      });

    const solarData: ChartDataValue[] = tides
      .filter((tide: MT.Tide): boolean => {
        return tide.isSolar;
      })
      .map((tide: MT.Tide): ChartDataValue => {
        if (tide.sunPosition.altitude > maxAltitude) maxAltitude = tide.sunPosition.altitude;

        if (tide.sunPosition.altitude < minAltitude) minAltitude = tide.sunPosition.altitude;

        return { x: tide.date.toMillis(), y: tide.sunPosition.altitude, tide };
      });

    const lunarData: ChartDataValue[] = tides
      .filter((tide: MT.Tide): boolean => {
        return tide.isLunar;
      })
      .map((tide: MT.Tide): ChartDataValue => {
        if (tide.moonPosition.altitude > maxAltitude) maxAltitude = tide.moonPosition.altitude;

        if (tide.moonPosition.altitude < minAltitude) minAltitude = tide.moonPosition.altitude;

        return { x: tide.date.toMillis(), y: tide.moonPosition.altitude, tide };
      });

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            yAxisID: 'tides',
            data: tideData,
            cubicInterpolationMode: 'monotone',
            borderColor: COLORS.tide,
            hoverBorderColor: COLORS.transparent,
            pointRadius: 0,
            pointHitRadius: 0,
          },
          {
            yAxisID: 'solar-lunar',
            data: solarData,
            cubicInterpolationMode: 'monotone',
            borderColor: COLORS.sun,
            hoverBorderColor: COLORS.transparent,
            pointRadius: 0,
            pointHitRadius: 0,
          },
          {
            yAxisID: 'solar-lunar',
            data: lunarData,
            cubicInterpolationMode: 'monotone',
            borderColor: COLORS.moon,
            hoverBorderColor: COLORS.transparent,
            pointRadius: 0,
            pointHitRadius: 0,
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
              callback: (tickValue): string => {
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
            grid: {
              drawOnChartArea: false,
            },
            max: 90,
            min: -90,
            position: 'right',
            title: {
              display: true,
              text: 'Altitude above horizon in degrees',
            },
            afterBuildTicks: (scale): void => {
              scale.ticks = altitideScales.map((value: number) => ({ value: value, label: value.toString() }));
            },
          },
        },
        plugins: {
          annotation: {
            annotations: {
              time: {
                type: 'line',
                xMax: currentTime,
                xMin: currentTime,
                borderColor: COLORS.time,
                borderWidth: 2,
              },
              yesterday: {
                type: 'box',
                xMin: labels[0],
                xMax: labels[2],
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 0,
              },
              tomorrow: {
                type: 'box',
                xMin: labels[6],
                xMax: labels[8],
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 0,
              },
            },
          },
          datalabels: {
            display: (context: DataLabelsContext): string | boolean => {
              return context.datasetIndex === 0;
            },
            formatter: (value: ChartDataValue, context: DataLabelsContext): string | null => {
              return context.datasetIndex === 0 ? `${value.tide.time}\n${value.tide.heightLabel}` : null;
            },
            color: (context: DataLabelsContext): string => {
              return context.datasetIndex === 0 ? COLORS.tide : 'rgba(0, 0, 0, 0)';
            },
            font: {
              lineHeight: 1,
              weight: 'bold',
            },
            textStrokeColor: 'white',
            textStrokeWidth: 5,
            textAlign: 'center',
            clip: true,
          },
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
      },
    });
  }

  //#endregion

  //#region render

  render(): tsx.JSX.Element {
    return (
      <calcite-dialog
        heading={this.station ? `${this.station.name} - ${this.station.date.toLocaleString(DateTime.DATE_FULL)}` : ''}
        modal
        scale="s"
        afterCreate={this.dialogAfterCreate.bind(this)}
      >
        {this.station ? (
          <div style="width:100%; height:100%;">
            <canvas afterCreate={this.createChart.bind(this)}></canvas>
          </div>
        ) : null}
      </calcite-dialog>
    );
  }

  private dialogAfterCreate(dialog: HTMLCalciteDialogElement): void {
    dialog.addEventListener('calciteDialogClose', (): void => {
      this.station = null;

      this.chart?.destroy();

      this.chart = null;
    });
  }

  //#endregion
}
