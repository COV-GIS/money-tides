import esri = __esri;

//#region modules

import './WeatherAdvisories.scss';

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import DateTime from '../utils/dateAndTimeUtils';
import CIMSymbol from '@arcgis/core/symbols/CIMSymbol';
// import Color from '@arcgis/core/Color';
import config from '../app-config';

//#endregion

const CSS_BASE = 'weather-advisories';

const CSS = {
  content: `${CSS_BASE}_content`,
  loader: `${CSS_BASE}_loader`,
  notice: `${CSS_BASE}_notice`,
};

let KEY = 0;

@subclass('WeatherAdvisories')
export default class WeatherAdvisories extends Widget {
  //#region lifecycle

  private _container!: HTMLCalciteAccordionElement;

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteAccordionElement) {
    this._container = value;
  }

  constructor(properties: esri.WidgetProperties & { view: esri.MapView }) {
    super(properties);
  }

  override postInitialize(): void {
    this.getAdvisories();
  }

  //#endregion

  //#region public properties

  public view!: esri.MapView;

  //#endregion

  public closeItems(): void {
    this.weatherAdvisoryItems.forEach((weatherAdvisoryItem: WeatherAdvisoryItem): void => {
      weatherAdvisoryItem.container.expanded = false;
    });
  }

  @property()
  private advisoryState: 'advisories' | 'error' | 'loading' | 'no-advisories' = 'loading';

  private weatherAdvisoryItems: Collection<WeatherAdvisoryItem> = new Collection();

  private weatherAdvisoryItemElements: Collection<tsx.JSX.Element> = new Collection();

  //#region private methods

  private async getAdvisories(): Promise<void> {
    const { advisoryState, weatherAdvisoryItemElements, weatherAdvisoryItems } = this;

    if (advisoryState !== 'no-advisories') this.advisoryState = 'loading';

    weatherAdvisoryItemElements.removeAll();

    weatherAdvisoryItems.removeAll();

    try {
      // const x = await(await fetch('https://mapservices.weather.noaa.gov/eventdriven/rest/services/WWA/watch_warn_adv/MapServer/1?f=pjson')).json();
      // console.log(x);

      // const y = {}

      // x.drawingInfo.renderer.uniqueValueInfos.forEach((x) => {

      //   y[x.value] = [x.symbol.color[0], x.symbol.color[1], x.symbol.color[2]];

      // });

      // console.log(y);

      const advisoryFeatures = (
        await config.weatherAdvisoryFeatureLayer.queryFeatures({
          geometry: config.weatherAdvisoryQueryPolygon,
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
            key={KEY++}
            afterCreate={(container: HTMLCalciteAccordionItemElement): void => {
              this.weatherAdvisoryItems.add(new WeatherAdvisoryItem({ container, feature, view: this.view }));
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
        <div class={CSS.loader}>
          <calcite-loader scale="s"></calcite-loader>
        </div>
      ) : advisoryState === 'no-advisories' ? (
        <div class={CSS.notice}>
          <calcite-notice icon="check" kind="success" open scale="s">
            <div slot="message">No weather advisories</div>
            <calcite-link slot="link" onclick={this.getAdvisories.bind(this)}>
              Refresh
            </calcite-link>
          </calcite-notice>
        </div>
      ) : advisoryState === 'advisories' ? (
        <calcite-accordion appearance="transparent" selection-mode="single" scale="s">
          {weatherAdvisoryItemElements.toArray()}
        </calcite-accordion>
      ) : (
        <div class={CSS.notice}>
          <calcite-notice icon="exclamation-point-f" kind="danger" open scale="s">
            <div slot="message">An error occurred loading weather advisories</div>
            <calcite-link slot="link" onclick={this.getAdvisories.bind(this)}>
              Try again
            </calcite-link>
          </calcite-notice>
        </div>
      );

    return <div>{content}</div>;
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

    feature.symbol = this.createSymbol(config.weatherAdvisoryColors[feature.attributes.prod_type]);
  }

  public feature!: esri.Graphic;

  public view!: esri.MapView;

  @property()
  private advisoryState: 'error' | 'loaded' | 'loading' = 'loading';

  @property({ aliasOf: 'feature.attributes' })
  private attributes: esri.Graphic['attributes'];

  private advisoryContent: tsx.JSX.Element | null = null;

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
        <div class={CSS.content} key={KEY++}>
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
        <div class={CSS.loader} key={KEY++}>
          <calcite-loader scale="s"></calcite-loader>
        </div>
      ) : advisoryState === 'loaded' ? (
        advisoryContent
      ) : (
        <div class={CSS.notice} key={KEY++}>
          <calcite-notice icon="exclamation-point-f" kind="danger" open scale="s">
            <div slot="message">An error occurred loading weather advisories</div>
            <calcite-link slot="link" onclick={this.getAdvisory.bind(this)}>
              Try again
            </calcite-link>
          </calcite-notice>
        </div>
      );

    return (
      <calcite-accordion-item
        class={CSS_BASE}
        description={`Expires ${date.toFormat('ccc h:mm a')}`}
        heading={prod_type}
        scale="s"
        style="--calcite-accordion-item-content-space: 0;"
      >
        {content}
      </calcite-accordion-item>
    );
  }
}
