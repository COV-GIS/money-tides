//#region types

import esri = __esri;
import { MT } from '../interfaces';

//#endregion

//#region modules

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import LayerBlurController from '../support/LayerBlurController';
import LayerLoopController from '../support/LayerLoopController';
import { applicationSettings, view, weatherLayers } from '../app-config';

//#endregion

@subclass('WeatherLayers')
export default class WeatherLayers extends Widget {
  //#region lifecycle

  private _container!: HTMLCalciteBlockElement;

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteBlockElement) {
    this._container = value;
  }

  override postInitialize(): void {
    weatherLayers.forEach((weatherLayer: MT.WeatherLayer): void => {
      const { blur, gradientScaleOptions, layer, layerLoopControllerOptions, legend } = weatherLayer;

      view.map?.add(layer);

      if (blur) new LayerBlurController({ layer, view });

      if (layerLoopControllerOptions) new LayerLoopController({ ...layerLoopControllerOptions, layer });

      this.weatherLayerItemElements.add(
        <calcite-list-item
          afterCreate={(listItem: HTMLCalciteListItemElement): void => {
            this.weatherLayerItems.add(
              new WeatherLayerItem({ container: listItem, gradientScaleOptions, layer, legend }),
            );
          }}
        ></calcite-list-item>,
        0,
      );
    });

    this.container.addEventListener('calciteBlockCollapse', this.clear.bind(this));
  }

  //#endregion

  public clear(): void {
    this.weatherLayerItems.forEach((weatherLayerItem: WeatherLayerItem): void => {
      weatherLayerItem.contentHidden = true;
    });
  }

  //#region private properties

  private weatherLayerItemElements: esri.Collection<tsx.JSX.Element> = new Collection();

  private weatherLayerItems: esri.Collection<WeatherLayerItem> = new Collection();

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    return (
      <calcite-block
        collapsible
        heading="Layers"
        icon-start="layers"
        scale={applicationSettings.scale}
        style="--calcite-block-content-space: 0; --calcite-list-background-color-hover: transparent; --calcite-list-background-color-press: transparent;"
      >
        <calcite-list scale={applicationSettings.scale} selection-mode="multiple">
          {this.weatherLayerItemElements.toArray()}
        </calcite-list>
      </calcite-block>
    );
  }

  //#endregion
}

@subclass('WeatherLayerItem')
class WeatherLayerItem extends Widget {
  //#region lifecycle

  private _container!: HTMLCalciteListItemElement;

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteListItemElement) {
    this._container = value;
  }

  constructor(
    properties: esri.WidgetProperties & {
      gradientScaleOptions?: MT.GradientScaleOptions;
      layer: esri.Layer;
      legend?: boolean;
    },
  ) {
    super(properties);
  }

  override postInitialize(): void {}

  //#endregion

  //#region public properties

  @property()
  public contentHidden = true;

  public gradientScaleOptions?: MT.GradientScaleOptions;

  public layer!: esri.Layer;

  public legend?: boolean;

  //#endregion

  //#region private properties
  //#endregion

  //#region events

  private contentActionClick(): void {
    this.contentHidden = !this.contentHidden;
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    const {
      contentHidden,
      gradientScaleOptions,
      layer,
      layer: { title },
      legend,
    } = this;

    return (
      <calcite-list-item
        label={title || 'Layer'}
        scale={applicationSettings.scale}
        afterCreate={this.listItemAfterCreate.bind(this)}
      >
        <calcite-action
          icon={contentHidden ? 'chevron-down' : 'chevron-up'}
          scale={applicationSettings.scale}
          slot="actions-end"
          text={contentHidden ? 'Expand' : 'Collapse'}
          onclick={this.contentActionClick.bind(this)}
        ></calcite-action>
        <div hidden={contentHidden} slot="content-bottom">
          <div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 0.5rem">
            {gradientScaleOptions ? (
              <div
                afterCreate={(container: HTMLDivElement): void => {
                  new GradientScale({ container, ...gradientScaleOptions });
                }}
              ></div>
            ) : null}
            {legend ? (
              <div
                afterCreate={(container: HTMLDivElement): void => {
                  new Legend({ container, layer });
                }}
              ></div>
            ) : null}
          </div>
        </div>
      </calcite-list-item>
    );
  }

  private listItemAfterCreate(listItem: HTMLCalciteListItemElement): void {
    const { layer } = this;

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
  }

  //#endregion
}

@subclass('GradientScale')
class GradientScale extends Widget {
  constructor(properties: MT.GradientScaleProperties) {
    super(properties);
  }

  override postInitialize(): void {
    this.gradientInfos.forEach((gradientInfo: MT.GradientInfo): void => {
      this.labels.push(<span>{gradientInfo.label}</span>);

      this.values.push(gradientInfo.value);
    });
  }

  public description = '';

  public gradientInfos!: MT.GradientInfo[];

  private labels: tsx.JSX.Element[] = [];

  private values: string[] = ['90deg'];

  override render(): tsx.JSX.Element {
    return (
      <div style="font-size: var(--calcite-font-size-xs);">
        <div style="width: 100%; display: flex; flex-direction: row; justify-content: space-between;">
          <div style="width: 0.125rem;"></div>
          <div style={`width: 100%; height: 16px; background: linear-gradient(${this.values.join(', ')});`}></div>
          <div style="width: 0.125rem;"></div>
        </div>
        <div style="display: flex; flex-direction: row; justify-content: space-between;">{this.labels}</div>
        <div style="width: 100; text-align: center;">{this.description}</div>
      </div>
    );
  }
}

@subclass('Legend')
class Legend extends Widget {
  constructor(properties: esri.WidgetProperties & { layer: esri.Layer }) {
    super(properties);
  }

  override postInitialize(): void {
    switch (this.layer.type) {
      case 'map-image':
        this.mapImageLegend();
        return;
      default:
        this.error = true;
        break;
    }
  }

  public layer!: esri.Layer;

  @property()
  private error = false;

  private items: esri.Collection<tsx.JSX.Element> = new Collection();

  private async mapImageLegend(): Promise<void> {
    const layer = this.layer as esri.MapImageLayer;

    const { allSublayers, url } = layer;

    try {
      const legendJson = await (await fetch(`${url}/legend?f=json`)).json();

      allSublayers.forEach((sublayer: esri.Sublayer): void => {
        const { id, sublayers, title } = sublayer;

        if (sublayers) return;

        const legendLayer = legendJson.layers.find((legend: any): boolean => {
          return legend.layerId === id;
        });

        if (!legendLayer) return;

        if (legendLayer.legend.length > 1) {
          const legendItems = legendLayer.legend.map((legendInfo: any): tsx.JSX.Element => {
            return (
              <div style="display: flex; flex-direction: row; align-items: center; gap: 0.5rem;">
                <img
                  alt={legendInfo.label}
                  style={`width: $${legendInfo.width}px; height: ${legendInfo.height}px;`}
                  src={`data:${legendInfo.contentType};base64,${legendInfo.imageData}`}
                ></img>
                <div>{legendInfo.label}</div>
              </div>
            );
          });

          this.items.push(
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div style="font-weight: var(--calcite-font-weight-medium);">{title}</div>
              {legendItems}
            </div>,
          );
        } else {
          const { contentType, height, imageData, width } = legendLayer.legend;

          this.items.push(
            <div style="display: flex; flex-direction: row; align-items: center; gap: 0.5rem;">
              <img
                alt={title}
                style={`width: $${width}px; height: ${height}px;`}
                src={`data:${contentType};base64,${imageData}`}
              ></img>
              <div>{title}</div>
            </div>,
          );
        }
      });
    } catch (error) {
      console.log('map image legend', error);

      this.error = true;
    }
  }

  override render(): tsx.JSX.Element {
    return (
      <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: var(--calcite-font-size-sm);">
        {this.items.toArray()}
      </div>
    );
  }
}
