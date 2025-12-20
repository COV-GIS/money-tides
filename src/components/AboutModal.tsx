//#region components

import '@esri/calcite-components/dist/components/calcite-dialog';
import '@esri/calcite-components/dist/components/calcite-notice';

//#endregion

//#region modules

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { moneyTypeColorHex } from '../utils/colorUtils';

//#endregion

@subclass('AboutModal')
export default class AboutModal extends Widget {
  //#region lifecycle

  private _container!: HTMLCalciteDialogElement;

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteDialogElement) {
    this._container = value;
  }

  //#endregion

  //#region public methods

  public open() {
    this.container.open = true;
  }

  //#endregion

  //#region render

  render(): tsx.JSX.Element {
    const medium = 'font-weight: var(--calcite-font-weight-medium);';

    const heading = `font-size: var(--calcite-font-size--1); ${medium}`;

    const shadow =
      'text-shadow: -1px -1px 2px rgba(0, 0, 0, 128), 1px -1px 2px rgba(0, 0, 0, 128), -1px 1px 2px rgba(0, 0, 0, 128), 1px 1px 2px rgba(0, 0, 0, 128);';

    return (
      <calcite-dialog heading="About" modal scale="s" width="s">
        <div style="display: flex; flex-direction: column; gap: 0.5rem; line-height: var(--calcite-font-line-height-relative-snug);">
          <calcite-notice closable icon="exclamation-point-f" kind="danger" open scale="s">
            <div slot="title">Disclaimer</div>
            <div slot="message">
              A goof made this to support his own goofy endevours. The information provided herein may or may not be
              accurate, and therefore is not suitable for anything.
              <br></br>
              <span style={medium}>Use at your own risk!</span>
            </div>
          </calcite-notice>
          <div style={heading}>What is a money tide?</div>
          <div>When the highest high tide of the day occurs at noon.</div>
          <div style={heading}>Why are money tides important?</div>
          <div>If you have to ask...you will never know.</div>
          <div style={heading}>How money is the day?</div>
          <div>
            <span style={this.classes(medium, moneyTypeColorHex('money', 'color'))}>Money</span>
            <span> - Highest high tide occurs between 11:00 AM and 1:00 PM</span>
          </div>
          <div>
            <span style={this.classes(medium, moneyTypeColorHex('mostly-money', 'color'), shadow)}>Mostly Money</span>
            <span> - Highest high tide occurs between 10:00 AM and 11:00 AM or between 1:00 PM and 2:00 PM</span>
          </div>
          <div>
            <span style={this.classes(medium, moneyTypeColorHex('kinda-money', 'color'), shadow)}>Kinda Money</span>
            <span> - Lowest high tide occurs between 11:00 AM and 1:00 PM</span>
          </div>
          <div>
            <span style={this.classes(medium, moneyTypeColorHex('potentially-money', 'color'), shadow)}>
              Potentially Money
            </span>
            <span> - Lowest high tide occurs between 10:00 AM and 11:00 AM or between 1:00 PM and 2:00 PM</span>
          </div>
          <div>
            <span style={this.classes(medium, moneyTypeColorHex('not-money', 'color'))}>Not Money</span>
            <span> - No high tide occurs between 10:00 AM and 2:00 PM</span>
          </div>
          <div style={heading}>A caveat about high tides</div>
          <div>
            Occasionally a location only experiences three tides (two high tides and one low tide, or one high tide and
            two low tides) in a calendar day. On such an occasion when a location experiences one high tide and two low
            tides, the single high tide will always occur between 10:00 AM and 2:00 PM, and so is a money or mostly
            money tide. But, it may be a low high tide in relation to the proceeding and upcoming high tides. So you
            might want to check to see if the single high tide is a high high tide.
          </div>
        </div>
      </calcite-dialog>
    );
  }

  //#endregion
}
