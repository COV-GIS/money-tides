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

  private stars = (): string => {
    const x = Math.round(Math.random() * 100);
    const y = Math.round(Math.random() * 100);

    return `
      radial-gradient(circle at ${x}% ${y}%, 
      rgba(255,255,255,1) 0%, 
      rgba(0, 72, 116,1) 3px, 
      rgba(0, 72, 116,0) 5px, 
      rgba(0, 72, 116,0) 100%) no-repeat border-box
    `;
  };

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
          <calcite-table scale="s" style="--calcite-table-border-color: none;">
            <calcite-table-row>
              <calcite-table-cell>Phase</calcite-table-cell>
              <calcite-table-cell>{moonPhase(station.moonIllumination.phase)}</calcite-table-cell>
            </calcite-table-row>

            <calcite-table-row>
              <calcite-table-cell>Illumination</calcite-table-cell>
              <calcite-table-cell>{(station.moonIllumination.fraction * 100).toFixed()}%</calcite-table-cell>
            </calcite-table-row>

            <calcite-table-row>
              <calcite-table-cell>Age</calcite-table-cell>
              <calcite-table-cell>{(station.moonIllumination.phase * 29.530589).toFixed(1)} days</calcite-table-cell>
            </calcite-table-row>
          </calcite-table>
        </div>
      </div>
    );
  }

  //#endregion
}
