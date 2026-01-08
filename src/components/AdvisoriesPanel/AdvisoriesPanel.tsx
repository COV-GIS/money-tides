//#region types

import esri = __esri;
import type AdvisoryItem from './AdvisoryItem';

//#endregion

//#region modules

import './AdvisoriesPanel.scss';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import PanelBase from '../PanelBase';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import {
  ICONS,
  applicationSettings,
  view,
  weatherAdvisoryFeatureLayer,
  weatherAdvisoryQueryPolygon,
} from '../../app-config';

//#endregion

//#region constants

const CSS_BASE = 'advisories-panel';

const CSS = {
  content: `${CSS_BASE}_content`,
};

//#endregion

@subclass('AdvisoriesPanel')
export default class AdvisoriesPanel extends PanelBase {
  //#region lifecycle

  override postInitialize(): void {
    this.getAdvisories();
  }

  //#endregion

  override hide(): void {
    this.visible = false;

    if (this.displayGraphic) {
      view.graphics.remove(this.displayGraphic);

      this.displayGraphic = null;
    }

    this.items.forEach((item: AdvisoryItem): void => {
      item.hidden = true;
    });
  }

  //#region private properties

  private displayGraphic: esri.Graphic | null = null;

  private itemElements: esri.Collection<tsx.JSX.Element> = new Collection();

  private items: esri.Collection<AdvisoryItem> = new Collection();

  @property()
  private loading = false;

  @property()
  private state: 'advisories' | 'error' | 'no-advisories' = 'no-advisories';

  //#endregion

  //#region private methods

  private async getAdvisories(): Promise<void> {
    const { itemElements, items } = this;

    this.loading = true;

    itemElements.removeAll();

    items.removeAll();

    try {
      const advisoryFeatures = (
        await weatherAdvisoryFeatureLayer.queryFeatures({
          geometry: weatherAdvisoryQueryPolygon,
          outFields: ['*'],
          orderByFields: ['expiration DESC'],
          returnGeometry: true,
        })
      ).features;

      if (!advisoryFeatures.length) {
        this.state = 'no-advisories';

        this.loading = false;

        return;
      }

      advisoryFeatures.forEach((feature: esri.Graphic): void => {
        this.itemElements.add(
          <calcite-list-item
            afterCreate={async (listItem: HTMLCalciteListItemElement): Promise<void> => {
              const item = new (await import('./AdvisoryItem')).default({ container: listItem, feature });

              this.items.add(item);
            }}
          ></calcite-list-item>,
        );
      });

      this.state = 'advisories';

      this.loading = false;
    } catch (error) {
      console.log('advisories query', error);

      this.state = 'error';

      this.loading = false;
    }
  }

  //#endregion

  //#region events

  private listChangeEvent(list: HTMLCalciteListElement): void {
    if (this.displayGraphic) {
      view.graphics.remove(this.displayGraphic);

      this.displayGraphic = null;
    }

    this.items.forEach((item: AdvisoryItem): void => {
      item.hidden = true;
    });

    const item = this.items.find((item: AdvisoryItem): boolean => {
      return item.container === list.selectedItems[0];
    });

    if (item) {
      const { feature } = item;

      item.hidden = false;

      this.displayGraphic = feature;

      view.graphics.add(feature, 0);

      view.goTo(feature);
    }
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    const { scale } = applicationSettings;

    const { itemElements, loading, state } = this;

    const content =
      state === 'no-advisories' ? (
        <calcite-notice icon="check" kind="success" open scale={scale}>
          <div slot="message">No weather advisories</div>
          <calcite-link slot="link" onclick={this.getAdvisories.bind(this)}>
            Refresh
          </calcite-link>
        </calcite-notice>
      ) : state === 'advisories' ? (
        <calcite-list
          selection-appearance="border"
          selection-mode="single"
          scale={scale}
          afterCreate={(list: HTMLCalciteListElement): void => {
            list.addEventListener('calciteListChange', this.listChangeEvent.bind(this, list));
          }}
        >
          {itemElements.toArray()}
        </calcite-list>
      ) : (
        <calcite-notice icon={ICONS.error} kind="danger" open scale={scale}>
          <div slot="message">An error occurred loading weather advisories</div>
          <calcite-link slot="link" onclick={this.getAdvisories.bind(this)}>
            Try again
          </calcite-link>
        </calcite-notice>
      );

    return (
      <calcite-panel
        class={this.classes(CSS_BASE, state !== 'advisories' ? CSS.content : '')}
        heading="Advisories"
        loading={loading}
        scale={scale}
      >
        {this.closeAction()}
        {content}
      </calcite-panel>
    );
  }

  //#endregion
}
