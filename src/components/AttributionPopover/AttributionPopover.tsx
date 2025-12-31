//#region types

import esri = __esri;

//#endregion

//#region modules

import './AttributionPopover.scss';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import AttributionViewModel from '@arcgis/core/widgets/Attribution/AttributionViewModel';
import { applicationSettings, view } from '../../app-config';

//#endregion

//#region constants

const CSS_BASE = 'attribution-popover';

const CSS = {
  content: `${CSS_BASE}_content`,
};

//#endregion

@subclass('AttributionPopover')
export default class AttributionPopover extends Widget {
  //#region lifecycle

  private _container!: HTMLCalcitePopoverElement;

  get container() {
    return this._container;
  }

  set container(value: HTMLCalcitePopoverElement) {
    this._container = value;
  }

  constructor(properties: esri.WidgetProperties & { referenceElementId: string }) {
    super(properties);
  }

  //#endregion

  //#region private properties

  private attribution = new AttributionViewModel({ view });

  @property({ aliasOf: 'attribution.items' })
  private attributionItems!: esri.Collection<esri.AttributionItem>;

  private referenceElementId = '';

  //#endregion

  //#region private methods

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    return (
      <calcite-popover
        auto-close=""
        class={CSS_BASE}
        closable
        heading="Powered by Esri"
        overlay-positioning="fixed"
        placement="leading"
        scale={applicationSettings.scale}
        reference-element={this.referenceElementId}
      >
        <div class={CSS.content}>
          {this.attributionItems
            ?.map((item: esri.AttributionItem): string => {
              return item.text;
            })
            .join(', ')}
        </div>
      </calcite-popover>
    );
  }

  //#endregion
}
