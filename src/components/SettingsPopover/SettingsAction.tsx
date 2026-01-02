//#region types

import esri = __esri;

//#endregion

//#region modules

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import SettingsPopover from './SettingsPopover';
import { applicationSettings } from '../../app-config';

//#endregion

//#region constants

const ID = 'money-tides-settings-PnJBjaRKYj';

//#endregion

@subclass('SettingsAction')
export default class SettingsAction extends Widget {
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

    shell.appendChild(this.popover.container);
  }

  //#endregion

  //#region private properties

  private popover = new SettingsPopover({
    container: document.createElement('calcite-popover'),
    referenceElementId: ID,
  });

  private onClick?: () => void;

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    return <calcite-action icon="gear" id={ID} scale={applicationSettings.scale} text="Settings"></calcite-action>;
  }

  //#endregion
}
