//#region components

import '@esri/calcite-components/dist/components/calcite-dialog';
import '@esri/calcite-components/dist/components/calcite-button';
import '@esri/calcite-components/dist/components/calcite-label';
import '@esri/calcite-components/dist/components/calcite-input-text';

//#endregion

//#region modules

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

//#endregion

//#region constants

const CSS_BASE = 'add-station-modal';

const CSS = {
  content: `${CSS_BASE}_content`,
  heading: `${CSS_BASE}_heading`,
  medium: `${CSS_BASE}_medium`,
};

//#endregion

@subclass('AddStationModal')
export default class AddStationModal extends Widget {
  //#region lifecycle

  private _container!: HTMLCalciteDialogElement;

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteDialogElement) {
    this._container = value;
  }

  //#endregion

  public open() {
    this.container.open = true;
  }

  private formSubmit(event: Event): void {
    event.preventDefault();

    const { stationId, stationName } = event.target as HTMLFormElement;

    this.emit('add-station', { stationId: stationId.value, stationName: stationName.value });

    this.container.open = false;

    this.container.querySelector('form')?.reset();
  }

  //#region render

  render(): tsx.JSX.Element {
    const id = `add-station-form_${this.id}`;

    return (
      <calcite-dialog class={CSS_BASE} heading="Add Station" modal width="s">
        <form id={id} onsubmit={this.formSubmit.bind(this)}>
          <calcite-label>
            Station id
            <calcite-input-text autocomplete="off" name="stationId" required></calcite-input-text>
          </calcite-label>
          <calcite-label>
            Station name (optional)
            <calcite-input-text autocomplete="off" name="stationName"></calcite-input-text>
          </calcite-label>
        </form>
        <calcite-button
          form={id}
          slot="footer-end"
          type="submit"
          onclick={(): void => {
            // work around for calcite form not working
            this.container.querySelector('form')?.requestSubmit();
          }}
        >
          Add Station
        </calcite-button>
      </calcite-dialog>
    );
  }

  //#endregion
}
