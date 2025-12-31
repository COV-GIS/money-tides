//#region types

import esri = __esri;

//#endregion

//#region modules

import './WeatherAdvisories.scss';

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import DateTime from '../../utils/dateAndTimeUtils';
import CIMSymbol from '@arcgis/core/symbols/CIMSymbol';
import {
  applicationSettings,
  view,
  weatherAdvisoryColors,
  weatherAdvisoryFeatureLayer,
  weatherAdvisoryQueryPolygon,
} from '../../app-config';

//#endregion

//#region constants

const CSS_BASE = 'weather-advisories';

const CSS = {
  content: `${CSS_BASE}_content`,
};

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
    this.getAdvisories();

    this.container.addEventListener('calciteBlockCollapse', this.clear.bind(this));
  }

  //#endregion

  //#region public properties
  //#endregion

  //#region public methods

  public clear(): void {
    this.weatherAdvisoryItems.forEach((weatherAdvisoryItem: WeatherAdvisoryItem): void => {
      weatherAdvisoryItem.container.expanded = false;
    });
  }

  //#endregion

  //#region private properties

  @property()
  private advisoryState: 'advisories' | 'error' | 'loading' | 'no-advisories' = 'loading';

  private weatherAdvisoryItems: Collection<WeatherAdvisoryItem> = new Collection();

  private weatherAdvisoryItemElements: Collection<tsx.JSX.Element> = new Collection();

  //#endregion

  //#region private methods

  private async getAdvisories(): Promise<void> {
    const { weatherAdvisoryItemElements, weatherAdvisoryItems } = this;

    this.advisoryState = 'loading';

    weatherAdvisoryItemElements.removeAll();

    weatherAdvisoryItems.removeAll();

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
        this.advisoryState = 'no-advisories';

        return;
      }

      advisoryFeatures.forEach((feature: esri.Graphic): void => {
        this.weatherAdvisoryItemElements.add(
          <calcite-accordion-item
            afterCreate={(container: HTMLCalciteAccordionItemElement): void => {
              this.weatherAdvisoryItems.add(new WeatherAdvisoryItem({ container, feature, view }));
            }}
          ></calcite-accordion-item>,
        );
      });

      this.advisoryState = 'advisories';
    } catch (error) {
      console.log('advisories query', error);

      this.advisoryState = 'error';
    }
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    const { advisoryState, weatherAdvisoryItemElements } = this;

    const content =
      advisoryState === 'loading' ? (
        <calcite-loader scale={applicationSettings.scale}></calcite-loader>
      ) : advisoryState === 'no-advisories' ? (
        <calcite-notice icon="check" kind="success" open scale={applicationSettings.scale}>
          <div slot="message">No weather advisories</div>
          <calcite-link slot="link" onclick={this.getAdvisories.bind(this)}>
            Refresh
          </calcite-link>
        </calcite-notice>
      ) : advisoryState === 'advisories' ? (
        <calcite-accordion
          appearance="transparent"
          icon-type="plus-minus"
          selection-mode="single"
          scale={applicationSettings.scale}
        >
          {weatherAdvisoryItemElements.toArray()}
        </calcite-accordion>
      ) : (
        <calcite-notice icon="exclamation-point-f" kind="danger" open scale={applicationSettings.scale}>
          <div slot="message">An error occurred loading weather advisories</div>
          <calcite-link slot="link" onclick={this.getAdvisories.bind(this)}>
            Try again
          </calcite-link>
        </calcite-notice>
      );

    return (
      <calcite-block
        class={CSS_BASE}
        collapsible
        heading="Advisories"
        icon-start="exclamation-mark-triangle"
        scale={applicationSettings.scale}
        style={advisoryState === 'advisories' ? '--calcite-block-content-space: 0;' : null}
      >
        {content}
      </calcite-block>
    );
  }

  //#endregion
}

@subclass('WeatherAdvisoryItem')
class WeatherAdvisoryItem extends Widget {
  //#region lifecycle

  private _container!: HTMLCalciteAccordionItemElement;

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteAccordionItemElement) {
    this._container = value;
  }

  constructor(properties: esri.WidgetProperties & { feature: esri.Graphic; view: esri.MapView }) {
    super(properties);
  }

  override postInitialize(): void {
    const { container, feature } = this;

    container.addEventListener('calciteAccordionItemExpand', this.getAdvisory.bind(this));

    container.addEventListener('calciteAccordionItemExpand', this.graphicDisplay.bind(this, true));

    container.addEventListener('calciteAccordionItemCollapse', this.graphicDisplay.bind(this, false));

    feature.symbol = this.createSymbol(weatherAdvisoryColors[feature.attributes.prod_type]);
  }

  //#endregion

  //#region public properties

  public feature!: esri.Graphic;

  public view!: esri.MapView;

  //#endregion

  //#region private properties

  @property()
  private advisoryState: 'error' | 'loaded' | 'loading' = 'loading';

  @property({ aliasOf: 'feature.attributes' })
  private attributes: esri.Graphic['attributes'];

  private advisoryContent: tsx.JSX.Element | null = null;

  //#endregion

  //#region private methods

  private createSymbol(color: [number, number, number]): esri.CIMSymbol {
    // const _color = new Color(color) as esri.Color & { isBright: boolean };

    return new CIMSymbol({
      data: {
        type: 'CIMSymbolReference',
        symbol: {
          type: 'CIMPolygonSymbol',
          symbolLayers: [
            {
              type: 'CIMSolidFill',
              enable: true,
              color: [...color, 128],
            },
            {
              type: 'CIMSolidStroke',
              effects: [
                {
                  type: 'CIMGeometricEffectDashes',
                  dashTemplate: [4.75, 4.75],
                  lineDashEnding: 'HalfPattern',
                  offsetAlongLine: 0,
                },
              ],
              enable: true,
              capStyle: 'Butt',
              joinStyle: 'Round',
              width: 2.25,
              // color: _color.isBright ? [0, 0, 0, 255] : [255, 255, 255, 255],
              // color: [255, 255, 255, 255],
              color: [...color, 255],
            },
            // {
            //   type: 'CIMSolidStroke',
            //   enable: true,
            //   capStyle: 'Butt',
            //   joinStyle: 'Round',
            //   width: 2.25,
            //   color: [...color, 255],
            // },
          ],
        },
      },
    });
  }

  private async getAdvisory(): Promise<void> {
    this.container.removeEventListener('calciteAccordionItemExpand', this.getAdvisory.bind(this));

    const {
      advisoryState,
      attributes: { url },
    } = this;

    if (advisoryState === 'loaded') return;

    this.advisoryState = 'loading';

    try {
      const advisory = await (await fetch(url)).json();

      const { areaDesc, description, instruction } = advisory.properties;

      const descriptions = description.split('\n\n');

      this.advisoryContent = (
        <div class={CSS.content}>
          <div>{areaDesc}</div>
          {descriptions.map((text: string): tsx.JSX.Element | null => {
            return text.includes('https') ? null : <div>{text.replace('* ', '')}</div>;
          })}
          {instruction ? <div>{instruction.replace('\n', ' ').replace('  ', ' ')}</div> : null}
        </div>
      );

      this.advisoryState = 'loaded';
    } catch (error) {
      console.log('advisory content', error);

      this.advisoryState = 'error';
    }
  }

  private graphicDisplay(display: boolean): void {
    const {
      feature,
      view,
      view: { graphics },
    } = this;

    if (display) {
      graphics.add(feature, 0);

      view.goTo(feature);
    } else {
      graphics.remove(feature);
    }
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    const {
      advisoryContent,
      advisoryState,
      attributes: { expiration, prod_type },
    } = this;

    const date = DateTime.fromISO(expiration).setZone('America/Los_Angeles');

    if (DateTime.now().setZone('America/Los_Angeles') > date) this.visible = false;

    const content =
      advisoryState === 'loading' ? (
        <calcite-loader scale={applicationSettings.scale}></calcite-loader>
      ) : advisoryState === 'loaded' ? (
        advisoryContent
      ) : (
        <calcite-notice icon="exclamation-point-f" kind="danger" open scale={applicationSettings.scale}>
          <div slot="message">An error occurred loading weather advisories</div>
          <calcite-link slot="link" onclick={this.getAdvisory.bind(this)}>
            Try again
          </calcite-link>
        </calcite-notice>
      );

    return (
      <calcite-accordion-item
        description={`Expires ${date.toFormat('ccc h:mm a')}`}
        heading={prod_type}
        scale={applicationSettings.scale}
        afterCreate={this.accordionItemAfterCreate.bind(this)}
      >
        {content}
      </calcite-accordion-item>
    );
  }

  private accordionItemAfterCreate(accordionItem: HTMLCalciteAccordionItemElement): void {
    const header = accordionItem.shadowRoot?.querySelector('div.header-text') as HTMLDivElement | null;

    if (header) {
      this.setHeaderStyles(header);
    } else {
      setTimeout(this.accordionItemAfterCreate.bind(this, accordionItem), 250);
    }
  }

  private setHeaderStyles(header: HTMLDivElement): void {
    // const heading = header.querySelector('.heading') as HTMLDivElement;

    const description = header.querySelector('.description') as HTMLSpanElement;

    // heading.style.fontWeight = 'var(--calcite-font-weight-regular)';

    description.style.marginBlockStart = '0';

    description.style.fontSize = 'var(--calcite-font-size-xs)';
  }

  //#endregion
}
