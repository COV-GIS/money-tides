//#region types

import esri = __esri;

//#endregion

//#region modules

import './DeclinationPopover.scss';
import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import DateTime from '../../utils/dateAndTimeUtils';
import { magneticDeclination } from '../../utils/sunAndMoonUtils';
import { applicationSettings } from '../../app-config';

//#endregion

//#region constants

const CSS_BASE = 'declination-popover';

const CSS = {
  content: `${CSS_BASE}_content`,
};

//#endregion

@subclass('DeclinationPopover')
export default class DeclinationPopover extends Widget {
  //#region lifecycle

  private _container!: HTMLCalcitePopoverElement;

  get container(): HTMLCalcitePopoverElement {
    return this._container;
  }

  set container(value: HTMLCalcitePopoverElement) {
    this._container = value;
  }

  constructor(properties: esri.WidgetProperties & { referenceElementId: string }) {
    super(properties);
  }

  override postInitialize(): void {
    this.updateDeclination();

    this.addHandles(watch((): DateTime => applicationSettings.date, this.updateDeclination.bind(this)));
  }

  //#endregion

  //#region private properties

  @property()
  private declination = 'Set your compass to ???.';

  private referenceElementId!: string;

  //#endregion

  //#region private methods

  private async updateDeclination(): Promise<void> {
    try {
      this.declination = `Set your compass to ${(await magneticDeclination(applicationSettings.date, 44.927, -124.013)).bearing}.`;
    } catch (error) {
      console.log('declination update', error);
      this.declination = 'An error occurred computing declination.';
    }
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    return (
      <calcite-popover
        auto-close=""
        class={CSS_BASE}
        closable
        heading="Declination"
        overlay-positioning="fixed"
        placement="leading"
        scale={applicationSettings.scale}
        reference-element={this.referenceElementId}
      >
        <div class={CSS.content}>{this.declination}</div>
      </calcite-popover>
    );
  }

  //#endregion
}
