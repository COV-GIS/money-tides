//#region types

import type { __MT as MT } from '../interfaces';

//#endregion

//#region components

import '@esri/calcite-components/dist/components/calcite-dialog';

//#endregion

//#region modules

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import DateTime from '../utils/dateAndTimeUtils';

//#endregion

//#region constants

const CSS_BASE = 'lunar-phase-modal';

const CSS = {
  container: `${CSS_BASE}_container`,
  dark: `${CSS_BASE}_dark`,
  divider: `${CSS_BASE}_divider`,
  hemisphere: `${CSS_BASE}_hemisphere`,
  info: `${CSS_BASE}_info`,
  light: `${CSS_BASE}_light`,
  medium: `${CSS_BASE}_medium`,
  moon: `${CSS_BASE}_moon`,
  sky: `${CSS_BASE}_sky`,
};

//#endregion

@subclass('LunarPhaseModal')
export default class LunarPhaseModal extends Widget {
  //#region lifecycle

  private _container!: HTMLCalciteDialogElement;

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteDialogElement) {
    this._container = value;
  }

  //#region public properties

  @property()
  public date?: DateTime;

  @property()
  public moon?: MT.Moon;

  //#endregion

  //#endregion

  //#region public methods

  public open() {
    this.container.open = true;
  }

  //#endregion

  //#region render

  render(): tsx.JSX.Element {
    if (!this.date || !this.moon) return <calcite-dialog></calcite-dialog>;

    const {
      date,
      moon: { distance, illuminationPercent, phase, phaseName },
    } = this;

    const degrees = 360 - Math.floor(phase * 360);

    return (
      <calcite-dialog
        class={CSS_BASE}
        heading={`Lunar Phase - ${date.toLocaleString(DateTime.DATE_FULL)}`}
        modal
        scale="s"
        width="s"
      >
        <div class={CSS.container}>
          <div class={CSS.sky}>
            <div class={CSS.moon}>
              <div class={degrees < 180 ? `${CSS.hemisphere} ${CSS.light}` : `${CSS.hemisphere} ${CSS.dark}`}></div>
              <div class={degrees < 180 ? `${CSS.hemisphere} ${CSS.dark}` : `${CSS.hemisphere} ${CSS.light}`}></div>
              <div class={CSS.divider} style={`transform: rotate3d(0, 1, 0, ${degrees}deg)`}></div>
            </div>
          </div>
          <div class={CSS.info}>
            <div>
              <span>Phase: </span>
              <span class={CSS.medium}>{phaseName}</span>
            </div>
            <div>
              <span>Illumination: </span>
              <span class={CSS.medium}>{illuminationPercent}</span>
            </div>
            <div>
              <span>Age: </span>
              <span class={CSS.medium}>{(phase * 29.530589).toFixed(1)}</span>
              <span> days</span>
            </div>
            <div>
              <span>Distance: </span>
              <span class={CSS.medium}>{distance.toLocaleString('en-us', { maximumFractionDigits: 0 })}</span>
              <span> km</span>
            </div>
          </div>
        </div>
      </calcite-dialog>
    );
  }

  //#endregion
}
