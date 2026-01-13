//#region types

import esri = __esri;
import { MT } from '../../interfaces';

//#endregion

//#region modules

import './GroupLayerItem.scss';
import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import { applicationSettings } from '../../app-config';

//#endregion

//#region constants

const CSS_BASE = 'layer-item';

const CSS = {
  content: `${CSS_BASE}_content`,
};

//#endregion

@subclass('GroupLayerItem')
export default class GroupLayerItem extends Widget {
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
      layer: esri.GroupLayer;
    },
  ) {
    super(properties);
  }

  override postInitialize(): void {



  }

  //#endregion

  //#region public properties

  public layer!: esri.GroupLayer;

  //#endregion

  //#region public methods

  public collapse(): void {
    this.contentHidden = true;
  }

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
      layer,
      layer: { title },
    } = this;

    const { scale } = applicationSettings;

    return (
      <calcite-list-item
        class={CSS_BASE}
        label={title || 'Layer'}
        scale={scale}
        afterCreate={this.listItemAfterCreate.bind(this, layer)}
      >
        <calcite-action
          icon={contentHidden ? 'chevron-down' : 'chevron-up'}
          scale={scale}
          slot="actions-end"
          text={contentHidden ? 'Expand' : 'Collapse'}
          onclick={this.contentActionClick.bind(this)}
        ></calcite-action>
        <div hidden={contentHidden} slot="content-bottom">
          <div class={CSS.content}>
            <calcite-list></calcite-list>
          </div>
        </div>
      </calcite-list-item>
    );
  }

  private listItemAfterCreate(layer: esri.Layer, listItem: HTMLCalciteListItemElement): void {
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
