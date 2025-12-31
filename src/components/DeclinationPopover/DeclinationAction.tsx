//#region types

import esri = __esri;
import type { DateTime } from 'luxon';

//#endregion

//#region modules

import { watch } from '@arcgis/core/core/reactiveUtils';
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

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteActionElement) {
    this._container = value;
  }

  constructor(properties?: esri.WidgetProperties & { onClick?: () => void }) {
    super(properties);
  }

  postInitialize(): void {
    if (this.onClick) {
      this.container.addEventListener('click', this.onClick);
    }

    const shell = document.querySelector('calcite-shell');

    if (!shell) return;

    const { declinationPopover } = this;

    shell.appendChild(declinationPopover.container);
  }

  //#endregion

  //#region private properties

  private declinationPopover = new DeclinationPopover({
    container: document.createElement('calcite-popover'),
    referenceElementId: ID,
  });

  private onClick?: () => void;

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    return (
      <calcite-action icon="explore" id={ID} scale={applicationSettings.scale} text="Declination"></calcite-action>
    );
  }

  //#endregion
}
