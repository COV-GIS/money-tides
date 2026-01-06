//#region modules

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import DeclinationPopover from './DeclinationPopover';
import { applicationSettings } from '../../app-config';

//#endregion

//#region constants

const ID = 'money-tides-declination-MDKHhMeEQm';

//#endregion

@subclass('AboutAction')
export default class AboutAction extends Widget {
  //#region lifecycle

  private _container!: HTMLCalciteActionElement;

  get container(): HTMLCalciteActionElement {
    return this._container;
  }

  set container(value: HTMLCalciteActionElement) {
    this._container = value;
  }

  postInitialize(): void {
    const shell = document.querySelector('calcite-shell');

    if (!shell) return;

    shell.appendChild(this.popover.container);
  }

  //#endregion

  //#region private properties

  private popover = new DeclinationPopover({
    container: document.createElement('calcite-popover'),
    referenceElementId: ID,
  });

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    return (
      <calcite-action icon="explore" id={ID} scale={applicationSettings.scale} text="Declination"></calcite-action>
    );
  }

  //#endregion
}
