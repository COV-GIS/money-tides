//#region modules

import './DisclaimerDialog.scss';
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Cookies from 'js-cookie';
import { applicationSettings } from '../app-config';

//#endregion

//#region constants

const COOKIE = 'money-tides-disclaimer-accepted';

const CSS_BASE = 'disclaimer-dialog';

const CSS = {
  content: `${CSS_BASE}_content`,
};

//#endregion

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
    const scale = applicationSettings.scale;

    return (
      <calcite-dialog
        class={CSS_BASE}
        close-disabled=""
        escape-disabled=""
        heading="Disclaimer"
        icon="exclamation-point-f"
        kind="brand"
        modal
        outside-close-disabled=""
        scale={scale}
        width={scale}
      >
        <div class={CSS.content}>
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
        <calcite-button scale={scale} slot="footer-end" onclick={this.gotIt.bind(this)}>
          Got It
        </calcite-button>
      </calcite-dialog>
    );
  }

  //#endregion
}
