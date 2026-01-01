//#region modules

import './LunarPhasePanel.scss';
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import PanelBase from '../PanelBase';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { sunAndMoon } from '../../utils/sunAndMoonUtils';
import { applicationSettings } from '../../app-config';

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
  moon: `${CSS_BASE}_moon`,
};

//#endregion

@subclass('LunarPhasePanel')
export default class LunarPhasePanel extends PanelBase {
  //#region private properties

  private latitude = 44.927;

  private longitude = -124.013;

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    const { latitude, longitude } = this;

    const {
      moon: { distance, distanceFromAverage, illuminationPercent, phase, phaseName },
    } = sunAndMoon(applicationSettings.date, latitude, longitude);

    const degrees = 360 - Math.floor(phase * 360);

    return (
      <calcite-panel class={CSS_BASE} heading="Lunar Phase" scale={applicationSettings.scale}>
        {this.closeAction()}
        <div class={CSS.container}>
          <div class={CSS.moon}>
            <div class={degrees < 180 ? `${CSS.hemisphere} ${CSS.light}` : `${CSS.hemisphere} ${CSS.dark}`}></div>
            <div class={degrees < 180 ? `${CSS.hemisphere} ${CSS.dark}` : `${CSS.hemisphere} ${CSS.light}`}></div>
            <div class={CSS.divider} style={`transform: rotate3d(0, 1, 0, ${degrees}deg)`}></div>
          </div>
          <div class={CSS.info}>
            <div>
              Phase: <strong>{phaseName}</strong>
            </div>
            <div>
              Illumination: <strong>{illuminationPercent}</strong>
            </div>
            <div>
              Age: <strong>{(phase * 29.530589).toFixed(1)}</strong> days
            </div>
            <div>
              Distance: <strong>{distance.toLocaleString('en-us', { maximumFractionDigits: 0 })}</strong> km
            </div>
            <div>
              From average: <strong>{distanceFromAverage.toLocaleString('en-us', { maximumFractionDigits: 0 })}</strong>{' '}
              km
            </div>
          </div>
        </div>
      </calcite-panel>
    );
  }

  //#endregion
}
