// https://www.weather.gov/gis/cloudgiswebservices

// https://opengeo.ncep.noaa.gov/geoserver/www/index.html

// https://www.wxtools.org/reflectivity

// https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer

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
import Collection from '@arcgis/core/core/Collection';
// import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
// import GroupLayer from '@arcgis/core/layers/GroupLayer';
// import ImageryLayer from '@arcgis/core/layers/ImageryLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
// import DateTime, { Interval } from '../utils/dateAndTimeUtils';

import RadarLayer from '../support/RadarLayer';

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

  //#endregion

  //#region private methods

  private async load(view: esri.MapView | undefined): Promise<void> {
    if (!view) return;

    if (LOAD_HANDLE) LOAD_HANDLE.remove();

    const waveHeight = (this.layers.waveHeight = new WMSLayer({
      opacity: 0.8,
      refreshInterval: 1,
      title: 'Wave Height',
      url: 'https://mapservices.weather.noaa.gov/geoserver/ndfd/waveh/ows?service=wms&version=1.3.0&request=GetCapabilities',
      visible: false,
    }));

    new RadarLayer({ intervals: 10, layer: waveHeight, rate: 2000, view });

    const radarBase = (this.layers.radarBase = new WMSLayer({
      opacity: 0.8,
      refreshInterval: 1,
      title: 'Radar (base)',
      url: 'https://opengeo.ncep.noaa.gov/geoserver/conus/conus_bref_qcd/ows?service=wms&version=1.3.0&request=GetCapabilities',
      visible: false,
    }));

    new RadarLayer({ layer: radarBase, view });

    const radarComposite = (this.layers.radarComposite = new WMSLayer({
      opacity: 0.8,
      refreshInterval: 1,
      title: 'Radar (composite)',
      url: 'https://opengeo.ncep.noaa.gov/geoserver/conus/conus_cref_qcd/ows?service=wms&version=1.3.0&request=GetCapabilities',
      visible: false,
    }));

    new RadarLayer({ layer: radarComposite, view });

    const cloudCover = (this.layers.cloudCover = new WMSLayer({
      opacity: 0.5,
      refreshInterval: 1,
      title: 'Cloud Cover',
      url: 'https://mapservices.weather.noaa.gov/geoserver/ndfd/sky/ows?service=wms&version=1.3.0&request=GetCapabilities',
      visible: false,
    }));

    new RadarLayer({ intervals: 10, layer: cloudCover, rate: 1000, view });

    const weatherFronts = (this.layers.weatherFronts = new MapImageLayer({
      sublayers: [
        {
          id: 1,
        },
        {
          id: 2,
        },
      ],
      title: 'Weather Fronts',
      url: 'https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/natl_fcst_wx_chart/MapServer',
      visible: false,
    }));

    view.map?.addMany([waveHeight, radarBase, radarComposite, cloudCover, weatherFronts]);

    this.loaded = true;
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
          afterCreate={this.layerListItemAfterCreate.bind(this, this.layers.weatherFronts)}
        ></calcite-list-item>
        <calcite-list-item
          class={CSS.item}
          scale="s"
          afterCreate={this.layerListItemAfterCreate.bind(this, this.layers.cloudCover)}
        ></calcite-list-item>
        <calcite-list-item
          class={CSS.item}
          scale="s"
          afterCreate={this.layerListItemAfterCreate.bind(this, this.layers.radarComposite)}
        ></calcite-list-item>
        <calcite-list-item
          class={CSS.item}
          scale="s"
          afterCreate={this.layerListItemAfterCreate.bind(this, this.layers.radarBase)}
        ></calcite-list-item>
        <calcite-list-item
          class={CSS.item}
          scale="s"
          afterCreate={this.layerListItemAfterCreate.bind(this, this.layers.waveHeight)}
        ></calcite-list-item>
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
