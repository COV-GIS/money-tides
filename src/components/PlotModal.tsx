//#region types

import type { MT } from '../interfaces';
import type { Scale, CoreScaleOptions, TooltipItem, ScriptableTooltipContext } from 'chart.js';
import type { Context as DataLabelsContext } from 'chartjs-plugin-datalabels';
import type { PartialEventContext } from 'chartjs-plugin-annotation';
type ChartDataValue = { x: number; y: number; tide: MT.Tide };

//#endregion

//#region components

import '@esri/calcite-components/dist/components/calcite-action';
import '@esri/calcite-components/dist/components/calcite-dialog';

//#endregion

//#region modules

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { tideHeight } from './MoneyTides';
import { getDocumentStyle } from '../utils/colorUtils';
import DateTime, { setTime, twelveHourTime } from '../utils/dateAndTimeUtils';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register([
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  ChartDataLabels,
  annotationPlugin,
]);

//#endregion

//#region constants

const COLORS = {
  moon: getDocumentStyle('--calcite-color-text-2'),
  moonTooltip: getDocumentStyle('--calcite-color-text-2', { opacity: 0.9, type: 'rgba' }),
  sun: getDocumentStyle('--calcite-color-status-warning'),
  sunTooltip: getDocumentStyle('--calcite-color-status-warning', { opacity: 0.9, type: 'rgba' }),
  tide: getDocumentStyle('--calcite-color-status-info'),
  tideTooltip: getDocumentStyle('--calcite-color-status-info', { opacity: 0.9, type: 'rgba' }),
  time: getDocumentStyle('--calcite-color-status-success'),
  transparent: 'rgba(0, 0, 0, 0)',
  yesterdayTomorrow: getDocumentStyle('--calcite-color-text-1', { opacity: 0.1, type: 'rgba' }),
  yesterdayTomorrowText: getDocumentStyle('--calcite-color-text-1', { opacity: 0.8, type: 'rgba' }),
};

const FONT_FAMILY = getDocumentStyle('--calcite-font-family');

const FONT = {
  family: FONT_FAMILY,
  lineHeight: 1,
  size: 12,
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

  private sunAndMoonHidden = true;

  //#endregion

  //#region private methods

  private data(tides: MT.Tide[]): {
    lunarData: ChartDataValue[];
    solarData: ChartDataValue[];
    tideData: ChartDataValue[];
    tideHeightMax: number;
    tideHeightMin: number;
  } {
    let tideHeightMax = 0;

    let tideHeightMin = 0;

    const lunarData: ChartDataValue[] = tides
      .filter((tide: MT.Tide): boolean => {
        return tide.isLunar;
      })
      .map((tide: MT.Tide): ChartDataValue => {
        return { x: tide.date.toMillis(), y: tide.moonPosition.altitude, tide };
      });

    const solarData: ChartDataValue[] = tides
      .filter((tide: MT.Tide): boolean => {
        return tide.isSolar;
      })
      .map((tide: MT.Tide): ChartDataValue => {
        return { x: tide.date.toMillis(), y: tide.sunPosition.altitude, tide };
      });

    const tideData: ChartDataValue[] = tides
      .filter((tide: MT.Tide): boolean => {
        return tide.isPrediction;
      })
      .map((tide: MT.Tide): ChartDataValue => {
        const { date, height } = tide;

        if (height > tideHeightMax) tideHeightMax = height;

        if (height < tideHeightMin) tideHeightMin = height;

        return { x: date.toMillis(), y: height, tide };
      });

    return {
      lunarData,
      solarData,
      tideData,
      tideHeightMax: Math.ceil(tideHeightMax) + 1,
      tideHeightMin: Math.floor(tideHeightMin) - 1,
    };
  }

  private labels(date: DateTime): number[] {
    return [
      setTime(date.minus({ day: 1 }), { hour: 12 }).toMillis(),
      setTime(date.minus({ day: 1 }), { hour: 18 }).toMillis(),
      setTime(date, { hour: 0 }).toMillis(),
      setTime(date, { hour: 6 }).toMillis(),
      setTime(date, { hour: 12 }).toMillis(),
      setTime(date, { hour: 18 }).toMillis(),
      setTime(date, { hour: 24 }).toMillis(),
      setTime(date.plus({ day: 1 }), { hour: 6 }).toMillis(),
      setTime(date.plus({ day: 1 }), { hour: 12 }).toMillis(),
    ];
  }

  private createChart(canvas: HTMLCanvasElement): void {
    if (!this.station) return;

    const {
      station: { date, tides },
      sunAndMoonHidden,
    } = this;

    const labels = this.labels(date);

    const { lunarData, solarData, tideData, tideHeightMax, tideHeightMin } = this.data(tides);

    const altitudeScales = [-75, -50, -25, 0, 25, 50, 75];

    const currentDate = DateTime.now().setZone('America/Los_Angeles');

    const currentTime = currentDate.toMillis();

    const currentContent = `${twelveHourTime(currentDate)} - ${tideHeight(tides, currentDate)} ft`;

    const yesterdayContent = date.minus({ day: 1 }).toLocaleString(DateTime.DATE_FULL);

    const tomorrowContent = date.plus({ day: 1 }).toLocaleString(DateTime.DATE_FULL);

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
            backgroundColor: COLORS.tide,
            pointHitRadius: 5,
          },
          {
            hidden: sunAndMoonHidden,
            yAxisID: 'solar-lunar',
            data: solarData,
            cubicInterpolationMode: 'monotone',
            borderColor: COLORS.sun,
            backgroundColor: COLORS.sun,
            borderWidth: 1.5,
            pointRadius: 2,
            pointHitRadius: 5,
          },
          {
            hidden: sunAndMoonHidden,
            yAxisID: 'solar-lunar',
            data: lunarData,
            cubicInterpolationMode: 'monotone',
            borderColor: COLORS.moon,
            backgroundColor: COLORS.moon,
            borderWidth: 1.5,
            pointRadius: 2,
            pointHitRadius: 5,
          },
        ],
      },
      options: {
        font: FONT,
        responsive: true,
        scales: {
          x: {
            type: 'linear',
            min: labels[0],
            max: labels[labels.length - 1],
            ticks: {
              count: labels.length,
              font: FONT,
              callback: (tickValue: string | number): string => {
                return twelveHourTime(DateTime.fromMillis(tickValue as number));
              },
            },
          },
          tides: {
            max: tideHeightMax,
            min: tideHeightMin,
            position: 'left',
            title: {
              display: true,
              font: FONT,
              text: 'Height in feet (MLLW)',
            },
            ticks: {
              font: FONT,
            },
          },
          'solar-lunar': {
            display: 'auto',
            grid: {
              drawOnChartArea: false,
            },
            max: altitudeScales[altitudeScales.length - 1],
            min: altitudeScales[0],
            position: 'right',
            title: {
              display: true,
              font: FONT,
              text: 'Altitude above horizon in degrees',
            },
            ticks: {
              font: FONT,
            },
            afterBuildTicks: (scale: Scale<CoreScaleOptions>): void => {
              scale.ticks = altitudeScales.map((value: number) => ({ value: value, label: value.toString() }));
            },
          },
        },
        plugins: {
          annotation: {
            annotations: {
              // horizon: {
              //   type: 'line',
              //   yScaleID: 'solar-lunar',
              //   yMax: 0,
              //   yMin: 0,
              //   borderColor: COLORS.horizon,
              //   borderWidth: 1,
              //   drawTime: 'beforeDraw',
              //   display: (context: PartialEventContext): boolean => {
              //     return context.chart.isDatasetVisible(1);
              //   },
              // },
              currentTimeAndTide: {
                type: 'line',
                xMax: currentTime,
                xMin: currentTime,
                borderColor: COLORS.time,
                borderWidth: 1,
                drawTime: 'beforeDatasetsDraw',
              },
              currentTimeAndTideLabel: {
                type: 'label',
                xValue: currentTime,
                yAdjust(context: PartialEventContext): number {
                  if (!context.chart.chartArea) return 5000;

                  return -(Math.floor(context.chart.chartArea.height / 2) - 10);
                },
                content: currentContent,
                color: COLORS.time,
                font: FONT,
                textStrokeColor: 'white',
                textStrokeWidth: 5,
                drawTime: 'beforeDatasetsDraw',
              },
              yesterdayLabel: {
                type: 'label',
                position: 'start',
                xAdjust(context: PartialEventContext): number {
                  if (!context.chart.chartArea) return 5000;
                  return -(Math.floor(context.chart.chartArea.width / 2) + 4);
                },
                yAdjust(context: PartialEventContext): number {
                  if (!context.chart.chartArea) return 5000;

                  return Math.floor(context.chart.chartArea.height / 2) - 20;
                },
                content: yesterdayContent,
                color: COLORS.yesterdayTomorrowText,
                font: FONT,
                textStrokeColor: 'white',
                textStrokeWidth: 3,
                drawTime: 'beforeDatasetsDraw',
              },
              tomorrowLabel: {
                type: 'label',
                position: 'end',
                xAdjust(context: PartialEventContext): number {
                  if (!context.chart.chartArea) return 5000;

                  return Math.floor(context.chart.chartArea.width / 2) + 2;
                },
                yAdjust(context: PartialEventContext): number {
                  if (!context.chart.chartArea) return 5000;

                  return Math.floor(context.chart.chartArea.height / 2) + 8;
                },
                content: tomorrowContent,
                color: COLORS.yesterdayTomorrowText,
                font: FONT,
                textStrokeColor: 'white',
                textStrokeWidth: 3,
                drawTime: 'beforeDatasetsDraw',
              },
              yesterday: {
                type: 'box',
                xMin: labels[0],
                xMax: labels[2],
                backgroundColor: COLORS.yesterdayTomorrow,
                borderWidth: 0,
                drawTime: 'beforeDraw',
              },
              tomorrow: {
                type: 'box',
                xMin: labels[6],
                xMax: labels[8],
                backgroundColor: COLORS.yesterdayTomorrow,
                borderWidth: 0,
                drawTime: 'beforeDraw',
              },
            },
          },
          datalabels: {
            offset: 0,
            display: (context: DataLabelsContext): string | boolean => {
              return context.datasetIndex === 0 || false;
            },
            formatter: (value: ChartDataValue, context: DataLabelsContext): string | null => {
              // return context.datasetIndex === 0 ? `${value.tide.time}\n${value.tide.heightLabel}` : null;
              return context.datasetIndex === 0 ? value.tide.heightLabel : null;
            },
            color: (context: DataLabelsContext): string => {
              return context.datasetIndex === 0 ? COLORS.tide : '';
            },
            align: (context: DataLabelsContext): 'center' | 'end' | 'start' => {
              const { dataIndex, dataset, datasetIndex } = context;

              let align = 'center';

              if (datasetIndex === 0 && (dataset.data[dataIndex] as ChartDataValue).tide.type === 'high tide')
                align = 'end';

              if (datasetIndex === 0 && (dataset.data[dataIndex] as ChartDataValue).tide.type === 'low tide')
                align = 'start';

              return align as 'center' | 'end' | 'start';
            },
            font: { ...FONT, weight: 'bold' },
            textStrokeColor: 'white',
            textStrokeWidth: 4,
            textAlign: 'center',
            clip: true,
          },
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem: TooltipItem<'line'>): string => {
                const {
                  dataset: { data },
                  dataIndex,
                  datasetIndex,
                } = tooltipItem;

                const { heightLabel, moonPosition, sunPosition } = (data[dataIndex] as ChartDataValue).tide;

                switch (datasetIndex) {
                  case 0:
                    return heightLabel;
                  case 1:
                    return `${sunPosition.azimuthBearing} ${
                      sunPosition.altitudeDegrees === '0°' ? '' : `@ ${sunPosition.altitudeDegrees}`
                    }`;
                  case 2:
                    return `${moonPosition.azimuthBearing} ${
                      moonPosition.altitudeDegrees === '0°' ? '' : `@ ${moonPosition.altitudeDegrees}`
                    }`;
                  default:
                    return '';
                }
              },
              title: (tooltipItem: TooltipItem<'line'>[]): string => {
                const {
                  dataset: { data },
                  dataIndex,
                } = tooltipItem[0];

                const { time, type } = (data[dataIndex] as ChartDataValue).tide;

                return `${time} - ${type}`;
              },
            },
            backgroundColor: (context: ScriptableTooltipContext<'line'>): string => {
              const { datasetIndex } = context.tooltip.dataPoints[0];

              switch (datasetIndex) {
                case 0:
                  return COLORS.tideTooltip;
                case 1:
                  return COLORS.sunTooltip;
                case 2:
                  return COLORS.moonTooltip;
                default:
                  return '';
              }
            },
            enabled: true,
            bodyFont: FONT,
            titleFont: { ...FONT, weight: 'normal' },
            displayColors: false,
          },
        },
      },
    });
  }

  private toggleSunAndMoon(): void {
    const { chart } = this;

    if (!chart) return;

    if (this.sunAndMoonHidden) {
      chart.getDatasetMeta(1).hidden = false;
      chart.getDatasetMeta(2).hidden = false;
    } else {
      chart.getDatasetMeta(1).hidden = true;
      chart.getDatasetMeta(2).hidden = true;
    }

    chart.update();

    this.sunAndMoonHidden = !this.sunAndMoonHidden;
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    return (
      <calcite-dialog
        heading={this.station ? `${this.station.name} - ${this.station.date.toLocaleString(DateTime.DATE_FULL)}` : ''}
        modal
        scale="s"
        afterCreate={this.dialogAfterCreate.bind(this)}
      >
        <calcite-action
          slot="header-menu-actions"
          scale="s"
          style="--calcite-dialog-min-size-y: 432px;"
          text={`${this.sunAndMoonHidden ? 'Show' : 'Hide'} Sun and Moon`}
          text-enabled=""
          onclick={this.toggleSunAndMoon.bind(this)}
        ></calcite-action>
        {this.station ? (
          <div style="position: relative; width:100%; height:100%;">
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
