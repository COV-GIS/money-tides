//#region types

import esri = __esri;

//#endregion

//#region modules
import './AboutDialog.scss';
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { applicationSettings } from '../../app-config';

//#endregion

//#region constants

const CSS_BASE = 'about-dialog';

const CSS = {
  content: `${CSS_BASE}_content`,
  heading: `${CSS_BASE}_heading`,
};

//#endregion

@subclass('AboutDialog')
export default class AboutDialog extends Widget {
  //#region lifecycle

  private _container = document.createElement('calcite-dialog');

  get container(): HTMLCalciteDialogElement {
    return this._container;
  }

  set container(value: HTMLCalciteDialogElement) {
    this._container = value;
  }

  constructor(properties?: esri.WidgetProperties) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);
  }

  //#endregion

  //#region public methods

  public open() {
    this.container.open = true;
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    const scale = applicationSettings.scale;

    return (
      <calcite-dialog class={CSS_BASE} heading="About Money Tides" modal scale={scale} width={scale}>
        <div class={CSS.content}>
          <div class={CSS.heading}>What is a money tide?</div>
          <div>When the highest high tide of the day occurs at noon.</div>
          <div class={CSS.heading}>Why are money tides important?</div>
          <div>If you have to ask...you will never know.</div>
          <div class={CSS.heading}>How money is the day?</div>
          <div>
            <strong>Money</strong>
            <span> - Highest high tide occurs between 11:00 AM and 1:00 PM</span>
          </div>
          <div>
            <strong>Mostly Money</strong>
            <span> - Highest high tide occurs between 10:00 AM and 11:00 AM or between 1:00 PM and 2:00 PM</span>
          </div>
          <div>
            <strong>Kinda Money</strong>
            <span> - Lowest high tide occurs between 11:00 AM and 1:00 PM</span>
          </div>
          <div>
            <strong>Potentially Money</strong>
            <span> - Lowest high tide occurs between 10:00 AM and 11:00 AM or between 1:00 PM and 2:00 PM</span>
          </div>
          <div>
            <strong>Not Money</strong>
            <span> - No high tide occurs between 10:00 AM and 2:00 PM</span>
          </div>
          <div class={CSS.heading}>A caveat about high tides</div>
          <div>
            Occasionally a location only experiences three tides (two high tides and one low tide, or one high tide and
            two low tides) in a calendar day. On such an occasion when a location experiences one high tide and two low
            tides, the single high tide will always occur between 10:00 AM and 2:00 PM, and so is a money or mostly
            money tide. But, it may be a low high tide in relation to the proceeding and upcoming high tides. So you
            might want to check to see if the single high tide is a high high tide.
          </div>
          <div class={CSS.heading}>Disclaimer</div>
          <div>A goof made Money Tides to support his own goofy endeavors.</div>
          <div>
            The information provided herein may or may not be accurate. There are no warranties, expressed or implied,
            including the warranty of merchantability or fitness for a particular purpose, accompanying the use of Money
            Tides.
          </div>
          <div>
            <strong>Use at your own risk!</strong>
          </div>
        </div>
      </calcite-dialog>
    );
  }

  //#endregion
}
