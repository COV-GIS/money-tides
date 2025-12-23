//#region components

import '@esri/calcite-components/dist/components/calcite-button';
import '@esri/calcite-components/dist/components/calcite-dialog';

//#endregion

//#region modules

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Cookies from 'js-cookie';

//#endregion

const COOKIE = 'money-tides-disclaimer-accepted';

@subclass('DisclaimerDialog')
export default class DisclaimerDialog extends Widget {
  //#region lifecycle

  private _container!: HTMLCalciteDialogElement;

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteDialogElement) {
    this._container = value;
  }

  //#endregion

  //#region static methods

  static isAccepted(): boolean {
    return Cookies.get(COOKIE) ? true : false;
  }

  //#endregion

  //#region private methods

  private gotIt(): void {
    Cookies.set(COOKIE, 'accepted', { expires: 60 });

    this.container.open = false;
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    return (
      <calcite-dialog
        close-disabled=""
        escape-disabled=""
        heading="Disclaimer"
        icon="exclamation-point-f"
        kind="danger"
        modal
        outside-close-disabled=""
        scale="s"
        width="s"
      >
        <div style="display: flex; flex-direction: column; gap: 0.5rem; line-height: var(--calcite-font-line-height-relative-snug);">
          <div>A goof made Money Tides to support his own goofy endevours.</div>
          <div>
            The information provided herein may or may not be accurate, and therefore is not suitable for any particular
            purpose.
          </div>
          <div style="font-weight: var(--calcite-font-weight-medium);">Use at your own risk!</div>
        </div>
        <calcite-button slot="footer-end" onclick={this.gotIt.bind(this)}>
          Got It
        </calcite-button>
      </calcite-dialog>
    );
  }

  //#endregion
}
