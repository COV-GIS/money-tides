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
import { view, weatherLayers } from '../app-config';

//#endregion

@subclass('WeatherAdvisories')
export default class WeatherAdvisories extends Widget {
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
      const { blur, layer, layerLoopControllerOptions } = weatherLayer;

      view.map?.add(layer);

      if (blur) new LayerBlurController({ layer, view });

      if (layerLoopControllerOptions) new LayerLoopController({ ...layerLoopControllerOptions, layer });

      this.weatherLayerItemElements.add(
        <calcite-list-item
          afterCreate={(listItem: HTMLCalciteListItemElement): void => {
            this.weatherLayerItems.add(new WeatherLayerItem({ container: listItem, layer }));
          }}
        ></calcite-list-item>,
        0,
      );
    });
  }

  //#endregion

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
        scale="s"
        style="--calcite-block-content-space: 0; --calcite-list-background-color-hover: transparent; --calcite-list-background-color-press: transparent;"
      >
        <calcite-list scale="s" selection-mode="multiple">
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

  constructor(properties: esri.WidgetProperties & { layer: esri.Layer }) {
    super(properties);
  }

  override postInitialize(): void {}

  //#endregion

  //#region public properties

  public layer!: esri.Layer;

  //#endregion

  //#region private properties

  @property()
  private contentHidden = true;

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
      layer: { title },
    } = this;

    return (
      <calcite-list-item label={title || 'Layer'} scale="s" afterCreate={this.listItemAfterCreate.bind(this)}>
        <calcite-action
          icon={contentHidden ? 'chevron-down' : 'chevron-up'}
          scale="s"
          slot="actions-end"
          text={contentHidden ? 'Expand' : 'Collapse'}
          onclick={this.contentActionClick.bind(this)}
        ></calcite-action>
        <div hidden={contentHidden} slot="content-bottom">
          <div class="test-ramp"></div>
          <div class="test-labels">
            <div>1</div>
            <div>2</div>
            <div>3</div>
            <div>4</div>
            <div>5</div>
            <div>7</div>
            <div>10</div>
            <div>12</div>
            <div>15</div>
            <div>20</div>
            <div>25</div>
            <div>30</div>
            <div>35</div>
            <div>40</div>
            <div>55</div>
            <div>60</div>
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
