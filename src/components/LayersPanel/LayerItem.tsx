//#region types

import esri = __esri;
import { MT } from '../../interfaces';

//#endregion

//#region modules

import './LayerItem.scss';
import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { applicationSettings } from '../../app-config';

//#endregion

//#region constants

const CSS_BASE = 'layer-item';

const CSS = {
  content: `${CSS_BASE}_content`,
};

//#endregion

@subclass('LayerItem')
export default class LayerItem extends Widget {
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

  // override postInitialize(): void {}

  //#endregion

  //#region public properties

  public gradientScaleOptions?: MT.GradientScaleOptions;

  public layer!: esri.Layer;

  public legend?: boolean;

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
      gradientScaleOptions,
      layer,
      layer: { title },
      legend,
    } = this;

    return (
      <calcite-list-item
        class={CSS_BASE}
        label={title || 'Layer'}
        scale={applicationSettings.scale}
        afterCreate={this.listItemAfterCreate.bind(this)}
      >
        <calcite-action
          icon={contentHidden ? 'legend' : 'x'}
          scale={applicationSettings.scale}
          slot="actions-end"
          text={contentHidden ? 'Expand' : 'Collapse'}
          onclick={this.contentActionClick.bind(this)}
        ></calcite-action>
        <div hidden={contentHidden} slot="content-bottom">
          <div class={CSS.content}>
            {gradientScaleOptions ? (
              <div
                afterCreate={async (container: HTMLDivElement): Promise<void> => {
                  new (await import('./GradientLegend')).default({ container, ...gradientScaleOptions });
                }}
              ></div>
            ) : null}
            {legend && layer.type === 'map-image' ? (
              <div
                afterCreate={async (container: HTMLDivElement): Promise<void> => {
                  new (await import('./MapImageLegend')).default({ container, layer: layer as esri.MapImageLayer });
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
