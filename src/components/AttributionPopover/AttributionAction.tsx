//#region types

import esri = __esri;

//#endregion

//#region modules

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import AttributionPopover from './AttributionPopover';
import { applicationSettings } from '../../app-config';

//#endregion

//#region constants

const ID = 'money-tides-attribution-9VKOPszg1a';

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

  private popover = new AttributionPopover({
    container: document.createElement('calcite-popover'),
    referenceElementId: ID,
  });

  private onClick?: () => void;

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    return (
      <calcite-action
        icon="map-information"
        id={ID}
        scale={applicationSettings.scale}
        text="Attribution"
      ></calcite-action>
    );
  }

  //#endregion
}
