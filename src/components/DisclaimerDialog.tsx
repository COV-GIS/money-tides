//#region modules

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Cookies from 'js-cookie';
import { application } from '../app-config';

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
        scale={application.scale}
        width="s"
      >
        <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: var(--calcite-font-size-sm); line-height: var(--calcite-font-line-height-relative-snug);">
          <div>A goof made Money Tides to support his own goofy endeavors.</div>
          <div>
            The information provided herein may or may not be accurate. There are no warranties, expressed or implied,
            including the warranty of merchantability or fitness for a particular purpose, accompanying the use of Money
            Tides.
          </div>
          <div style="font-weight: var(--calcite-font-weight-medium);">Use at your own risk!</div>
        </div>
        <calcite-button scale={application.scale} slot="footer-end" onclick={this.gotIt.bind(this)}>
          Got It
        </calcite-button>
      </calcite-dialog>
    );
  }

  //#endregion
}
