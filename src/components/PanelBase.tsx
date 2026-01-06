//#region modules

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { applicationSettings } from '../app-config';

//#endregion

@subclass('PanelBase')
export default class PanelBase extends Widget {
  //#region lifecycle

  private _container!: HTMLCalcitePanelElement;

  get container() {
    return this._container;
  }

  set container(value: HTMLCalcitePanelElement) {
    this._container = value;
  }

  //#endregion

  //#region public properties

  @property()
  public override visible = false;

  //#endregion

  //#region public methods

  public hide(): void {
    this.visible = false;
  }

  public show(): void {
    this.visible = true;
  }

  //#endregion

  //#region private methods

  private close(): void {
    this.visible = false;

    this.emit('close');
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    return <calcite-panel></calcite-panel>;
  }

  protected closeAction(): tsx.JSX.Element {
    return (
      <calcite-action
        icon="x"
        scale={applicationSettings.scale}
        slot="header-actions-end"
        text="Close"
        onclick={this.close.bind(this)}
      ></calcite-action>
    );
  }

  //#endregion
}
