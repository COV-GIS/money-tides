//#region types

import esri = __esri;

//#endregion

//#region modules

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Panel from './Panel';
import { tsx } from '@arcgis/core/widgets/support/widget';
import ImageryLayer from '@arcgis/core/layers/ImageryLayer';
import DateTime, { Interval } from '../utils/dateAndTimeUtils';

//#endregion

let LOAD_HANDLE: IHandle | nullish;

@subclass('WeatherPanel')
export default class WeatherPanel extends Panel {
  //#region lifecycle

  constructor(properties?: esri.WidgetProperties & { view: esri.MapView }) {
    super(properties);

    if (properties && properties.view) {
      this.load(properties.view);
    } else {
      LOAD_HANDLE = watch((): esri.MapView | undefined => this.view, this.load.bind(this));
    }
  }

  //#endregion

  //#region public properties

  @property()
  public view?: esri.MapView;

  //#endregion

  //#region public methods
  //#endregion

  @property()
  private loaded = false;

  private radarLayer!: esri.ImageryLayer;

  private async load(view: esri.MapView | undefined): Promise<void> {
    if (!view) return;

    if (LOAD_HANDLE) LOAD_HANDLE.remove();

    const radarLayer = (this.radarLayer = new ImageryLayer({
      effect: `blur(${view.zoom * 2}px)`,
      interpolation: 'cubic',
      opacity: 0.8,
      popupEnabled: false,
      popupTemplate: null,
      refreshInterval: 5,
      url: 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer',
      visible: false,
    }));

    view.map?.add(radarLayer);

    this.addHandles(
      watch(
        (): number => view.zoom,
        (zoom: number): void => {
          if (!Number.isInteger(zoom)) return;

          radarLayer.effect = `blur(${zoom < 10 ? zoom * 2 : zoom * 4}px)`;
        },
      ),
    );

    await radarLayer.load();

    console.log(radarLayer);

    this.loaded = true;
  }

  private radarLoopInterval: number | nullish = null;

  private async radarLoop(event: Event): Promise<void> {
    const action = event.target as HTMLCalciteActionElement;

    const { radarLayer } = this;

    if (action.icon === 'pause' && this.radarLoopInterval) {
      action.icon = 'play';

      clearInterval(this.radarLoopInterval);

      this.radarLoopInterval = null;

      radarLayer.refresh();

      return;
    }

    action.icon = 'pause';

    if (!radarLayer.visible) radarLayer.visible = true;

    radarLayer.refresh();

    const fullTimeExtent = (radarLayer.timeInfo as esri.TimeInfo).fullTimeExtent as esri.TimeExtent; // know layer has time extent

    const start = DateTime.fromJSDate(fullTimeExtent.start as Date) as DateTime;
    const end = DateTime.fromJSDate(fullTimeExtent.end as Date) as DateTime;

    const intervals = Interval.fromDateTimes(start, end).divideEqually(100);

    let index = 0;

    this.radarLoopInterval = setInterval((): void => {
      if (this.radarLoopInterval && intervals.length === index) {
        action.icon = 'play';

        clearInterval(this.radarLoopInterval);

        this.radarLoopInterval = null;

        return;
      }

      const { end, start } = intervals[index] as Interval;

      radarLayer.timeExtent = {
        start: (start as DateTime).toJSDate(),
        end: (end as DateTime).toJSDate(),
      };

      index++;
    }, 100);
  }

  //#region render

  override render(): tsx.JSX.Element {
    const { loaded } = this;

    return (
      <calcite-panel heading="Weather" scale="s" style={loaded ? '' : '--calcite-panel-space: 0.5rem;'}>
        {this.closeAction()}
        {loaded ? (
          this.renderContent()
        ) : (
          <calcite-notice icon="exclamation-mark-triangle" kind="danger" open scale="s" style="width: 100%;">
            <div slot="title">On snap</div>
            <div slot="message">Weather seems to be having an issue loading</div>
          </calcite-notice>
        )}
      </calcite-panel>
    );
  }

  private renderContent(): tsx.JSX.Element[] {
    return [
      <calcite-list scale="s" selection-mode="multiple">
        <calcite-list-item
          label="Radar Base Reflectivity"
          scale="s"
          selected={this.radarLayer.visible}
          style="--calcite-list-background-color-hover: transparent; --calcite-list-background-color-press: transparent;"
          afterCreate={(listItem: HTMLCalciteListItemElement): void => {
            listItem.addEventListener('calciteListItemSelect', (): void => {
              this.radarLayer.visible = listItem.selected;
            });
          }}
        >
          <calcite-action
            icon="play"
            scale="s"
            slot="actions-end"
            text="Play Loop"
            onclick={this.radarLoop.bind(this)}
          ></calcite-action>
          <calcite-action
            icon="chevron-left"
            scale="s"
            slot="actions-end"
            text="Expand"
            afterCreate={(action: HTMLCalciteActionElement): void => {
              action.addEventListener('click', (): void => {
                const content = (action.parentElement as HTMLCalciteListItemElement).querySelector(
                  'div[slot="content-bottom"]',
                ) as HTMLDivElement;

                content.hidden = !content.hidden;

                action.icon = content.hidden ? 'chevron-left' : 'chevron-down';
              });
            }}
          ></calcite-action>
          <div
            hidden
            slot="content-bottom"
            style="border-top: 1px solid var(--calcite-color-border-3); padding: 0.75rem; font-size: var(--calcite-font-size--2);"
          ></div>
        </calcite-list-item>
      </calcite-list>,
    ];
  }

  //#endregion
}

// console.log(radarLayer);

// const fullTimeExtent = (radarLayer.timeInfo as esri.TimeInfo).fullTimeExtent as esri.TimeExtent; // know layer has time extent

// const start = DateTime.fromJSDate(fullTimeExtent.start as Date) as DateTime;
// const end = DateTime.fromJSDate(fullTimeExtent.end as Date) as DateTime;

// const intervals = Interval.fromDateTimes(start, end).divideEqually(100);

// let index = 0;

// const run = setInterval((): void => {
//   const { end, start } = intervals[index] as Interval;

//   radarLayer.timeExtent = {
//     start: start.toJSDate(),
//     end: end.toJSDate(),
//   };

//   // if (intervals.length - 1 === index) clearInterval(run);

//   index = intervals.length - 1 === index ? 0 : index++;

//   index++;
// }, 100);

// https://www.weather.gov/gis/cloudgiswebservices

// const radar = new ImageryLayer({
//   url: 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer',
//   opacity: 0.5,
// });

// radar.when((): void => {
//   console.log('time info', radar.timeInfo);

//   radar.timeExtent = {
//     start: radar.timeInfo?.fullTimeExtent?.start,
//     end: radar.timeInfo?.fullTimeExtent?.end,
//   };

//   console.log('start', radar.timeInfo?.fullTimeExtent?.start);
//   console.log('end', radar.timeInfo?.fullTimeExtent?.end);
//   console.log('now', new Date());

//   const start = DateTime.fromJSDate(radar.timeInfo?.fullTimeExtent?.start);
//   const end = DateTime.fromJSDate(radar.timeInfo?.fullTimeExtent?.end);

//   const intervals = Interval.fromDateTimes(start, end).divideEqually(15);

//   console.log(intervals);

//   let index = 0;

//   setInterval((): void => {
//     const { end, start } = intervals[index];

//     radar.timeExtent = {
//       start: start.toJSDate(),
//       end: start.toJSDate(),
//     };

//     index = intervals.length - 2 === index ? 0 : index + 1;

//   }, 500);
// });
