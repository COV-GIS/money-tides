import esri = __esri;

import '@esri/calcite-components/dist/components/calcite-action';
import '@esri/calcite-components/dist/components/calcite-action-bar';
import '@esri/calcite-components/dist/components/calcite-action-group';

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import ZoomViewModel from '@arcgis/core/widgets/Zoom/ZoomViewModel';
import AttributionViewModel from '@arcgis/core/widgets/Attribution/AttributionViewModel';

const CSS_BASE = 'map-controls';

const CSS = {
  base: CSS_BASE,
  actions: `${CSS_BASE}_actions`,
  content: `${CSS_BASE}_content`,
};

@subclass('MapControls')
export default class MapControls extends Widget {
  constructor(properties: esri.WidgetProperties & { view: esri.MapView }) {
    super(properties);
  }

  postInitialize(): void {
    this._attribution = new AttributionViewModel({ view: this.view });

    this._zoom = new ZoomViewModel({ view: this.view });
  }

  view!: esri.MapView;

  private _attribution!: esri.AttributionViewModel;

  @property({ aliasOf: '_attribution.items' })
  private _attributionItems?: esri.Collection<esri.AttributionItem>;

  private _zoom!: esri.ZoomViewModel;

  render(): tsx.JSX.Element {
    const { _zoom } = this;

    const attribution = this._attributionItems
      ?.map((item: esri.AttributionItem): string => {
        return item.text;
      })
      .join(', ');

    const id = `map-controls-attribution_${this.id}`;

    return (
      <div class={CSS.base}>
        <div class={CSS.actions}>
          <calcite-action-bar expand-disabled="" floating>
            <calcite-action-group>
              <calcite-action
                text="Zoom in"
                icon="plus"
                scale="s"
                disabled={!_zoom.canZoomIn}
                onclick={_zoom.zoomIn.bind(_zoom)}
              ></calcite-action>
              <calcite-action
                text="Zoom out"
                icon="minus"
                scale="s"
                disabled={!_zoom.canZoomOut}
                onclick={_zoom.zoomOut.bind(_zoom)}
              ></calcite-action>
            </calcite-action-group>
          </calcite-action-bar>
          <calcite-action-bar expand-disabled="" floating>
            <calcite-action icon="map-information" id={id} scale="s" text="Attribution"></calcite-action>
            <calcite-popover
              auto-close=""
              closable
              heading="Powered by Esri"
              overlay-positioning="fixed"
              placement="top"
              scale="s"
              reference-element={id}
            >
              <div class={CSS.content}>{attribution}</div>
            </calcite-popover>
          </calcite-action-bar>
        </div>
      </div>
    );
  }
}
