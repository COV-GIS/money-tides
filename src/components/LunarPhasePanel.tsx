//#region modules

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Panel from './Panel';
import { tsx } from '@arcgis/core/widgets/support/widget';
import DateTime, { setNoon } from '../utils/dateAndTimeUtils';
import { sunAndMoon } from '../utils/sunAndMoonUtils';
import { application } from '../app-config';

//#endregion

//#region constants

const CSS_BASE = 'lunar-phase-panel';

const CSS = {
  container: `${CSS_BASE}_container`,
  dark: `${CSS_BASE}_dark`,
  divider: `${CSS_BASE}_divider`,
  hemisphere: `${CSS_BASE}_hemisphere`,
  info: `${CSS_BASE}_info`,
  light: `${CSS_BASE}_light`,
  medium: `${CSS_BASE}_medium`,
  moon: `${CSS_BASE}_moon`,
};

//#endregion

@subclass('LunarPhasePanel')
export default class LunarPhasePanel extends Panel {
  //#region public properties

  @property()
  public date = setNoon(DateTime.now());

  public latitude = 44.927;

  public longitude = -124.013;

  //#endregion

  //#region render

  render(): tsx.JSX.Element {
    const { date, latitude, longitude } = this;

    const {
      moon: { distance, illuminationPercent, phase, phaseName },
    } = sunAndMoon(date, latitude, longitude);

    const degrees = 360 - Math.floor(phase * 360);

    return (
      <calcite-panel class={CSS_BASE} heading="Lunar Phase" scale={application.scale}>
        {this.closeAction()}
        <div class={CSS.container}>
          <div class={CSS.moon}>
            <div class={degrees < 180 ? `${CSS.hemisphere} ${CSS.light}` : `${CSS.hemisphere} ${CSS.dark}`}></div>
            <div class={degrees < 180 ? `${CSS.hemisphere} ${CSS.dark}` : `${CSS.hemisphere} ${CSS.light}`}></div>
            <div class={CSS.divider} style={`transform: rotate3d(0, 1, 0, ${degrees}deg)`}></div>
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
      </calcite-panel>
    );
  }

  //#endregion
}
