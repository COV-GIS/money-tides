//#region modules

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

//#endregion

@subclass('Panel')
export default class Panel extends Widget {
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

  public override visible = false;

  //#endregion

  //#region private methods

  private close(): void {
    this.visible = false;

    this.emit('hide');
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
        scale="s"
        slot="header-actions-end"
        text="Close"
        onclick={this.close.bind(this)}
      ></calcite-action>
    );
  }

  //#endregion
}
