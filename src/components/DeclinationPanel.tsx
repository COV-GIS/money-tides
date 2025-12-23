//#region modules

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Panel from './Panel';
import { tsx } from '@arcgis/core/widgets/support/widget';

//#endregion

@subclass('DeclinationPanel')
export default class DeclinationPanel extends Panel {
  //#region lifecycle
  //#endregion

  //#region public properties
  //#endregion

  //#region public methods
  //#endregion

  //#region render

  render(): tsx.JSX.Element {
    return (
      <calcite-panel heading="Declination" scale="s">
        {this.closeAction()}
      </calcite-panel>
    );
  }

  //#endregion
}
