//#region types

import esri = __esri;

//#endregion

//#region modules

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';

//#endregion

@subclass('MapImageLegend')
export default class MapImageLegend extends Widget {
  constructor(properties: esri.WidgetProperties & { layer: esri.MapImageLayer }) {
    super(properties);
  }

  override async postInitialize(): Promise<void> {
    const layer = this.layer;

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

  public layer!: esri.MapImageLayer;

  @property()
  private error = false;

  private items: esri.Collection<tsx.JSX.Element> = new Collection();

  override render(): tsx.JSX.Element {
    return (
      <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: var(--calcite-font-size-sm);">
        {this.items.toArray()}
      </div>
    );
  }
}
