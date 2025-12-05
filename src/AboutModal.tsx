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

  //#region public methods

  public open() {
    this.container.open = true;
  }

  //#endregion

  //#region render

  render(): tsx.JSX.Element {
    return (
      <calcite-dialog class={CSS_BASE} heading="About" modal>
        <div class={CSS.content}>
          <p class={CSS.heading}>What is a money tide?</p>
          <p>A money tide is when the highest high tide of the calendar day (12:00 AM to 12:00 AM) occurs at noon.</p>
          <p class={CSS.heading}>Why are money tides important?</p>
          <p>If you have to ask...you will never know.</p>
          <p class={CSS.heading}>How money is a high tide?</p>
          <p>
            <span class="money">Money</span>
            &nbsp;&nbsp;&nbsp;
            <span>Highest high tide occurs between 11:00 AM and 1:00 PM</span>
          </p>
          <p>
            <span class="mostly-money">Mostly Money</span>
            &nbsp;&nbsp;&nbsp;
            <span>Highest high tide occurs between 10:00 AM and 11:00 AM or between 1:00 PM and 2:00 PM</span>
          </p>
          <p>
            <span class="kinda-money">Kinda Money</span>
            &nbsp;&nbsp;&nbsp;
            <span>Lowest high tide occurs between 11:00 AM and 1:00 PM</span>
          </p>
          <p>
            <span class="potentially-money">Potentially Money</span>
            &nbsp;&nbsp;&nbsp;
            <span>Lowest high tide occurs between 10:00 AM and 11:00 AM or between 1:00 PM and 2:00 PM</span>
          </p>
          <p>
            <span class="not-money">Not Money</span>
            &nbsp;&nbsp;&nbsp;
            <span>Neither the highest high tide or lowest high tide occurs between 10:00 AM and 2:00 PM</span>
          </p>
          {/* <p class={CSS.heading}>A caveat about tides</p>
          <p>
            The Oregon coast experiences semi-diurnal tides (two high and two low tides per solar day). The rotation of
            the earth and the earth's positional relationship to the sun and moon as the earth orbits the sun results in
            a highest high tide, a lowest high tide, a highest low tide, and a lowest low tide per solar day. However,
            the sun and moon do not care about you or how you keep track of time. As a result, there will be calendar
            days when a location only experiences three tides (two high tides and one low tide OR one high tide and two
            low tides). On such an occasion when a location experiences one high tide and two low tides in a calendar
            day, the single high tide will always occur between 10:00 AM and 2:00 PM, and so is a{' '}
            <span class="money">Money</span> or <span class="mostly-money">Mostly Money</span> tide. It may be a low
            high tide in relation to the proceeding and upcoming high tides.
          </p> */}
        </div>
      </calcite-dialog>
    );
  }

  //#endregion
}
