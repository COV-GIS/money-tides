//#region types

import esri = __esri;

//#endregion

//#region modules

import './AdvisoryItem.scss';
import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import DateTime from '../../utils/dateAndTimeUtils';
import CIMSymbol from '@arcgis/core/symbols/CIMSymbol';
import { ICONS, applicationSettings, weatherAdvisoryColors } from '../../app-config';

//#endregion

//#region constants

const CSS_BASE = 'advisory-item';

const CSS = {
  advisory: `${CSS_BASE}_advisory`,
  content: `${CSS_BASE}_content`,
};

const HANDLE = 'advisory-item-content-handle';

//#endregion

@subclass('AdvisoryItem')
export default class AdvisoryItem extends Widget {
  //#region lifecycle

  private _container!: HTMLCalciteListItemElement;

  get container(): HTMLCalciteListItemElement {
    return this._container;
  }

  set container(value: HTMLCalciteListItemElement) {
    this._container = value;
  }

  constructor(properties: esri.WidgetProperties & { feature: esri.Graphic }) {
    super(properties);
  }

  override postInitialize(): void {
    const { feature } = this;

    feature.symbol = this.createSymbol(weatherAdvisoryColors[feature.attributes.prod_type]);

    this.addHandles(
      watch(
        (): boolean => this.hidden,
        (): void => {
          this.removeHandles(HANDLE);

          this.getAdvisory();
        },
      ),
      HANDLE,
    );
  }

  //#endregion

  //#region public properties

  public feature!: esri.Graphic;

  //#endregion

  //#region public methods

  public clear(): void {
    this.emit('hide-graphic');

    this.container.selected = false;

    this.hidden = true;
  }

  //#endregion

  //#region private properties

  @property({ aliasOf: 'feature.attributes' })
  private attributes: esri.Graphic['attributes'];

  @property()
  private hidden = true;

  @property()
  private content: tsx.JSX.Element | null = null;

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
    const {
      attributes: { url },
    } = this;

    this.content = <calcite-loader label="Loading advisory..."></calcite-loader>;

    try {
      const advisory = await (await fetch(url)).json();

      const { areaDesc, description, instruction } = advisory.properties;

      const descriptions = description.split('\n\n');

      this.content = (
        <div class={CSS.advisory}>
          <div>{areaDesc}</div>
          {descriptions.map((text: string): tsx.JSX.Element | null => {
            return text.includes('https') ? null : <div>{text.replace('* ', '')}</div>;
          })}
          {instruction ? <div>{instruction.replace('\n', ' ').replace('  ', ' ')}</div> : null}
        </div>
      );
    } catch (error) {
      console.log('advisory content', error);

      this.content = (
        <calcite-notice icon={ICONS.error} kind="danger" open scale={applicationSettings.scale}>
          <div slot="message">An error occurred loading advisory info</div>
          <calcite-link slot="link" onclick={this.getAdvisory.bind(this)}>
            Try again
          </calcite-link>
        </calcite-notice>
      );
    }
  }

  //#endregion

  private listItemSelectEvent(): void {
    const { feature } = this;

    if (this.container.selected) {
      this.emit('show-graphic', feature);

      this.hidden = false;
    } else {
      this.emit('hide-graphic');

      this.hidden = true;
    }
  }

  //#region render

  override render(): tsx.JSX.Element {
    const { scale } = applicationSettings;

    const {
      attributes: { expiration, prod_type },
      content,
      hidden,
    } = this;

    const date = DateTime.fromISO(expiration).setZone('America/Los_Angeles');

    if (DateTime.now().setZone('America/Los_Angeles') > date) this.visible = false;

    return (
      <calcite-list-item
        class={CSS_BASE}
        description={`Expires ${date.toFormat('ccc h:mm a')}`}
        label={prod_type}
        scale={scale}
        afterCreate={(listItem: HTMLCalciteListItemElement): void => {
          listItem.addEventListener('calciteListItemSelect', this.listItemSelectEvent.bind(this));
        }}
      >
        <div class={CSS.content} hidden={hidden} slot="content-bottom">
          {content}
        </div>
      </calcite-list-item>
    );
  }

  //#endregion
}
