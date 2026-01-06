//#region types

import esri = __esri;
import type LayerItem from './LayerItem';

//#endregion

//#region modules

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import PanelBase from '../PanelBase';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import { applicationSettings, view, weatherLayers } from '../../app-config';

//#endregion

//#region constants

let KEY = 0;

//#endregion

@subclass('LayersPanel')
export default class LayersPanel extends PanelBase {
  //#region lifecycle

  override async postInitialize(): Promise<void> {
    for (const weatherLayer of weatherLayers) {
      const { blur, gradientScaleOptions, layer, layerLoopControllerOptions, legend } = weatherLayer;

      view.map?.add(layer);

      if (blur) new (await import('../../support/LayerBlurController')).default({ layer, view });

      if (layerLoopControllerOptions)
        new (await import('../../support/LayerLoopController')).default({ ...layerLoopControllerOptions, layer });

      this.layerItemElements.add(
        <calcite-list-item
          key={KEY++}
          scale={applicationSettings.scale}
          afterCreate={async (listItem: HTMLCalciteListItemElement): Promise<void> => {
            this.layerItems.add(
              new (await import('./LayerItem')).default({
                container: listItem,
                gradientScaleOptions,
                layer,
                legend,
              }),
            );
          }}
        ></calcite-list-item>,
        0,
      );
    }
  }

  //#endregion

  override hide(): void {
    this.visible = false;

    this.layerItems.forEach((layerItem: LayerItem): void => {
      layerItem.collapse();
    });
  }

  //#region private properties

  private layerItemElements: esri.Collection<tsx.JSX.Element> = new Collection();

  private layerItems: esri.Collection<LayerItem> = new Collection();

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    const { scale } = applicationSettings;

    return (
      <calcite-panel heading="Layers" scale={scale}>
        {this.closeAction()}
        <calcite-list scale={scale} selection-mode="multiple">
          {this.layerItemElements.toArray()}
        </calcite-list>
      </calcite-panel>
    );
  }

  //#endregion
}
