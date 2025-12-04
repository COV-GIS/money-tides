//#region components

import '@esri/calcite-components/dist/components/calcite-dialog';

//#endregion

//#region modules

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

//#endregion

//#region constants

const CSS_BASE = 'about-modal';

const CSS = {
  content: `${CSS_BASE}_content`,
  heading: `${CSS_BASE}_heading`,
  medium: `${CSS_BASE}_medium`,
};

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

  public open() {
    this.container.open = true;
  }

  //#region render

  render(): tsx.JSX.Element {
    return (
      <calcite-dialog class={CSS_BASE} heading="About" modal>
        <div class={CSS.content}>
          <p class={CSS.heading}>What is a money tide?</p>
          <p>Strictly speaking...a money tide is when the highest high tide of the day occurs at noon.</p>
          <p class={CSS.heading}>How money is a high tide?</p>
          <p>
            <span class={CSS.medium} money="4">
              Money
            </span>
            &nbsp;&nbsp;&nbsp;
            <span>Highest high tide falls between 11 AM and 1 PM</span>
          </p>
          <p>
            <span class={CSS.medium} money="3">
              Mostly Money
            </span>
            &nbsp;&nbsp;&nbsp;
            <span>Highest high tide falls between 10 AM and 11 AM or between 1 PM and 2 PM</span>
          </p>
          <p>
            <span class={CSS.medium} money="2">
              Kinda Money
            </span>
            &nbsp;&nbsp;&nbsp;
            <span>Lowest high tide falls between 11 AM and 1 PM</span>
          </p>
          <p>
            <span class={CSS.medium} money="1">
              Potentially Money
            </span>
            &nbsp;&nbsp;&nbsp;
            <span>Lowest high tide falls between 10 AM and 11 AM or between 1 PM and 2 PM</span>
          </p>
          <p>
            <span class={CSS.medium} money="0">
              Not Money
            </span>
            &nbsp;&nbsp;&nbsp;
            <span>None of the above</span>
          </p>
          <p>
            <span class={CSS.medium}>Note: </span>
            Only one high tide may occur within a 24 hour period (12 AM to 12 AM). In such a scenario the single high tide is{' '}
            <span class={CSS.medium} money="4">
              Money
            </span>{' '}
            by default. However, the proceeding and upcoming high tides may be higher.
          </p>
        </div>
      </calcite-dialog>
    );
  }

  //#endregion
}
