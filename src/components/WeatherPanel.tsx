// https://www.weather.gov/gis/cloudgiswebservices

// https://www.wxtools.org/reflectivity

// https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/NOAA_METAR_current_wind_speed_direction_v1/FeatureServer

// https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/NWS_Watches_Warnings_v1/FeatureServer

//#region types

import esri = __esri;

//#endregion

//#region modules

import './WeatherPanel.scss';

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Panel from './Panel';
import { tsx } from '@arcgis/core/widgets/support/widget';
// import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import ImageryLayer from '@arcgis/core/layers/ImageryLayer';
// import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import DateTime, { Interval } from '../utils/dateAndTimeUtils';

//#endregion

//#region constants

const CSS_BASE = 'weather-panel';

const CSS = {
  content: `${CSS_BASE}_content`,
  item: `${CSS_BASE}_item`,
};

let LOAD_HANDLE: IHandle | nullish;

//#endregion

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

  //#region private properties

  @property()
  private loaded = false;

  private layers: Record<string, esri.Layer> = {};

  private radarLayer!: esri.ImageryLayer;

  private loopRadarInterval: number | nullish = null;

  //#endregion

  //#region private methods

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
      title: 'Radar Base Reflectivity',
      url: 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer',
      visible: false,
    }));

    view.map?.addMany([radarLayer]);

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

    this.loaded = true;
  }

  private async loopRadar(event: Event): Promise<void> {
    const action = event.target as HTMLCalciteActionElement;

    const { radarLayer } = this;

    if (action.icon === 'pause' && this.loopRadarInterval) {
      action.icon = 'play';

      clearInterval(this.loopRadarInterval);

      this.loopRadarInterval = null;

      radarLayer.refresh();

      return;
    }

    action.icon = 'pause';

    if (!radarLayer.visible) radarLayer.visible = true;

    // radarLayer.refresh();

    const fullTimeExtent = (radarLayer.timeInfo as esri.TimeInfo).fullTimeExtent as esri.TimeExtent; // know layer has time extent

    const start = DateTime.fromJSDate(fullTimeExtent.start as Date) as DateTime;
    const end = DateTime.fromJSDate(fullTimeExtent.end as Date) as DateTime;

    const intervals = Interval.fromDateTimes(start, end).divideEqually(20);

    let index = 0;

    this.loopRadarInterval = setInterval((): void => {
      if (this.loopRadarInterval && intervals.length === index) {
        action.icon = 'play';

        clearInterval(this.loopRadarInterval);

        this.loopRadarInterval = null;

        radarLayer.timeExtent = null;

        return;
      }

      const interval = intervals[index] as Interval;

      radarLayer.timeExtent = {
        start: (interval.start as DateTime).toJSDate(),
        end: (interval.end as DateTime).toJSDate(),
      };

      index++;
    }, 250);
  }

  private toggleListItemContent(event: Event): void {
    const action = event.target as HTMLCalciteActionElement;

    const content = (action.parentElement as HTMLCalciteListItemElement).querySelector(
      'div[slot="content-bottom"]',
    ) as HTMLDivElement | null;

    if (!content) return;

    content.hidden = !content.hidden;

    action.icon = content.hidden ? 'chevron-left' : 'chevron-down';
  }

  //#endregion

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
          class={CSS.item}
          scale="s"
          afterCreate={this.layerListItemAfterCreate.bind(this, this.radarLayer)}
        >
          <calcite-action
            icon="play"
            scale="s"
            slot="actions-end"
            text="Play Loop"
            onclick={this.loopRadar.bind(this)}
          ></calcite-action>
          {/* TODO: add current time and better loop controls in content */}
          {/* <calcite-action
            icon="chevron-left"
            scale="s"
            slot="actions-end"
            text="Expand"
            onclick={this.toggleListItemContent.bind(this)}
          ></calcite-action>
          <div class={CSS.content} hidden slot="content-bottom">
            <div></div>
          </div> */}
        </calcite-list-item>
      </calcite-list>,
    ];
  }

  private layerListItemAfterCreate(layer: esri.Layer, listItem: HTMLCalciteListItemElement): void {
    listItem.selected = layer.visible;

    listItem.label = layer.title || 'Layer';

    listItem.addEventListener('calciteListItemSelect', (): void => {
      layer.visible = listItem.selected;
    });

    this.addHandles(
      watch(
        (): boolean => layer.visible,
        (visible: boolean): void => {
          listItem.selected = visible;
        },
      ),
    );
  }

  //#endregion
}
