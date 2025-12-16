import type { Station } from '../typings';

//#region modules

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { moonPhase } from '../utils/sunAndMoonUtils';

//#endregion

const CSS_BASE = 'moon-info';

const CSS = {
  dark: `${CSS_BASE}_dark`,
  divider: `${CSS_BASE}_divider`,
  hemisphere: `${CSS_BASE}_hemisphere`,
  info: `${CSS_BASE}_info`,
  light: `${CSS_BASE}_light`,
  medium: `${CSS_BASE}_medium`,
  moon: `${CSS_BASE}_moon`,
  sky: `${CSS_BASE}_sky`,
};

@subclass('MoonInfo')
export default class MoonInfo extends Widget {
  //#region lifecycle

  private _container!: HTMLDivElement;

  get container() {
    return this._container;
  }

  set container(value: HTMLDivElement) {
    this._container = value;
  }

  constructor(properties?: __esri.WidgetProperties) {
    super(properties);
  }

  //#endregion

  //#region public properties

  @property()
  public station?: Station;

  //#endregion

  //#region public methods

  //#endregion

  //#region render

  render(): tsx.JSX.Element {
    const { station } = this;

    if (!station) return <div></div>;

    console.log(station);

    const degrees = 360 - Math.floor(station.moonIllumination.phase * 360);

    return (
      <div class={CSS_BASE}>
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
            <span class={CSS.medium}>{moonPhase(station.moonIllumination.phase)}</span>
          </div>
          <div>
            <span>Illumination: </span>
            <span class={CSS.medium}>{(station.moonIllumination.fraction * 100).toFixed()}%</span>
          </div>
          <div>
            <span>Age: </span>
            <span class={CSS.medium}>{(station.moonIllumination.phase * 29.530589).toFixed(1)}</span>
            <span> days</span>
          </div>
        </div>
      </div>
    );
  }

  //#endregion
}
