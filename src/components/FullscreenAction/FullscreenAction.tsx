//#region modules

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { applicationSettings } from '../../app-config';

//#endregion

@subclass('FullscreenAction')
export default class FullscreenAction extends Widget {
  //#region lifecycle

  private _container!: HTMLCalciteActionElement;

  get container(): HTMLCalciteActionElement {
    return this._container;
  }

  set container(value: HTMLCalciteActionElement) {
    this._container = value;
  }

  override postInitialize(): void {
    document.addEventListener('fullscreenchange', (): void => {
      this.active = document.fullscreenElement ? true : false;
    });
  }

  //#endregion

  //#region private properties

  @property()
  private active = false;

  private disabled = document.fullscreenEnabled ? false : true;

  //#endregion

  //#region private methods

  private toggle(): void {
    if (this.active) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    return (
      <calcite-action
        disabled={this.disabled}
        icon={this.active ? 'full-screen-exit' : 'extent'}
        scale={applicationSettings.scale}
        text="Fullscreen"
        onclick={this.toggle.bind(this)}
      ></calcite-action>
    );
  }

  //#endregion
}
