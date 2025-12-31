//#region types

import type AboutDialog from './AboutDialog';

//#endregion

//#region modules

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { applicationSettings } from '../../app-config';

//#endregion

@subclass('AboutAction')
export default class AboutAction extends Widget {
  //#region lifecycle

  private _container!: HTMLCalciteActionElement;

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteActionElement) {
    this._container = value;
  }

  //#endregion

  //#region private properties

  private aboutDialog?: AboutDialog;

  //#endregion

  //#region private methods

  private async open(): Promise<void> {
    if (!this.aboutDialog) {
      this.aboutDialog = new (await import('./AboutDialog')).default();
    }

    this.aboutDialog.open();
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    return (
      <calcite-action
        icon="question"
        scale={applicationSettings.scale}
        text="About"
        onclick={this.open.bind(this)}
      ></calcite-action>
    );
  }

  //#endregion
}
