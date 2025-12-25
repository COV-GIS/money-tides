// https://www.weather.gov/gis/cloudgiswebservices

// https://opengeo.ncep.noaa.gov/geoserver/www/index.html

// https://www.wxtools.org/reflectivity

// https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer

// https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/NOAA_METAR_current_wind_speed_direction_v1/FeatureServer

// https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/NWS_Watches_Warnings_v1/FeatureServer

//#region types

import esri = __esri;
import type { MT } from '../interfaces';
type LayerInfo = { listItem: tsx.JSX.Element; layer: esri.Layer; radarLayerControl?: RadarLayerControl };

//#endregion

//#region modules

import './WeatherPanel.scss';

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Panel from './Panel';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import ImageryLayer from '@arcgis/core/layers/ImageryLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import Cookies from 'js-cookie';
import RadarLayerControl from '../support/RadarLayerControl';

import config from '../app-config';

//#endregion

//#region constants

const CSS_BASE = 'weather-panel';

const CSS = {
  content: `${CSS_BASE}_content`,
  item: `${CSS_BASE}_item`,
  notice: `${CSS_BASE}_notice`,
};

const COOKIE = 'money-tides-weather-notice';

let KEY = 0;

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

  private layerInfos: Collection<LayerInfo> = new Collection();

  //#endregion

  //#region private methods

  private async load(view: esri.MapView | undefined): Promise<void> {
    if (!view) return;

    if (LOAD_HANDLE) LOAD_HANDLE.remove();

    const { layerInfos } = this;

    config.weatherLayers.forEach((weatherLayer: MT.WeatherLayer): void => {
      const { properties, type } = weatherLayer;

      let layer!: esri.FeatureLayer | esri.GroupLayer | esri.ImageryLayer | esri.MapImageLayer | esri.WMSLayer;

      let radarLayerControl: RadarLayerControl | undefined;

      switch (type) {
        case 'feature':
          layer = new FeatureLayer(properties);

          break;
        case 'group':
          layer = new GroupLayer(properties);

          break;
        case 'imagery':
          layer = new ImageryLayer(properties);

          break;
        case 'map-image':
          layer = new MapImageLayer(properties);

          break;
        case 'wms':
          layer = new WMSLayer(properties);

          if (weatherLayer.radarLayerControlProperties)
            radarLayerControl = new RadarLayerControl({ ...weatherLayer.radarLayerControlProperties, layer, view });

          break;
      }

      view.map?.add(layer);

      layerInfos.add(
        {
          listItem: (
            <calcite-list-item
              class={CSS.item}
              key={KEY++}
              label={layer.title || 'Layer'}
              scale="s"
              afterCreate={(listItem: HTMLCalciteListItemElement): void => {
                listItem.selected = layer.visible;

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
              }}
            ></calcite-list-item>
          ),
          layer,
          radarLayerControl,
        },
        0,
      );
    });

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
    const { layerInfos, loaded } = this;

    return (
      <calcite-panel heading="Weather" scale="s" style={loaded ? '' : '--calcite-panel-space: 0.5rem;'}>
        {this.closeAction()}
        {Cookies.get(COOKIE) ? null : (
          <div class={CSS.notice}>
            <calcite-notice
              closable
              open
              scale="s"
              afterCreate={(notice: HTMLCalciteNoticeElement): void => {
                notice.addEventListener('calciteNoticeClose', (): void => {
                  Cookies.set(COOKIE, 'noticed', { expires: 14 });

                  this.scheduleRender();
                });
              }}
            >
              <div slot="message">Weather layers and advisories are current and do not reflect selected tide date.</div>
            </calcite-notice>
          </div>
        )}
        {loaded ? (
          <calcite-list scale="s" selection-mode="multiple">
            {layerInfos
              .map((layerInfo: LayerInfo): tsx.JSX.Element => {
                return layerInfo.listItem;
              })
              .toArray()}
          </calcite-list>
        ) : (
          <calcite-notice icon="exclamation-mark-triangle" kind="danger" open scale="s" style="width: 100%;">
            <div slot="title">On snap</div>
            <div slot="message">Weather seems to be having an issue loading</div>
          </calcite-notice>
        )}
      </calcite-panel>
    );
  }

  //#endregion
}
