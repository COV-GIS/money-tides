import esri = __esri;

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import AttributionViewModel from '@arcgis/core/widgets/Attribution/AttributionViewModel';

@subclass('Attribution')
export default class Attribution extends Widget {
  constructor(properties: esri.WidgetProperties & { view: esri.MapView }) {
    super(properties);
  }

  postInitialize(): void {
    this.attribution = new AttributionViewModel({ view: this.view });
  }

  view!: esri.MapView;

  private attribution!: esri.AttributionViewModel;

  @property({ aliasOf: 'attribution.items' })
  private attributionItems?: esri.Collection<esri.AttributionItem>;

  render(): tsx.JSX.Element {
    const attribution = this.attributionItems
      ?.map((item: esri.AttributionItem): string => {
        return item.text;
      })
      .join(', ');

    const id = `attribution_${this.id}`;

    return (
      <calcite-action-bar expand-disabled="" floating>
        <calcite-action icon="map-information" id={id} scale="s" text="Attribution"></calcite-action>
        <calcite-popover
          auto-close=""
          closable
          heading="Powered by Esri"
          overlay-positioning="fixed"
          placement="top"
          scale="s"
          style="--calcite-popover-text-color: var(--calcite-color-text-2);"
          reference-element={id}
        >
          <div style="max-width: 360px; padding: var(--calcite-spacing-sm); font-size: var(--calcite-font-size--2);">
            {attribution}
          </div>
        </calcite-popover>
      </calcite-action-bar>
    );
  }
}
