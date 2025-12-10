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

  //#region public methods

  public open() {
    this.container.open = true;
  }

  //#endregion

  //#region private methods

  private formSubmit(event: Event): void {
    event.preventDefault();

    const { stationId, stationName } = event.target as HTMLFormElement;

    this.emit('add-station', { stationId: stationId.value, stationName: stationName.value });

    this.container.open = false;

    this.container.querySelector('form')?.reset();
  }

  //#endregion

  //#region render

  render(): tsx.JSX.Element {
    const id = `add-station-form_${this.id}`;

    return (
      <calcite-dialog heading="Add Station" modal width="s">
        <form id={id} onsubmit={this.formSubmit.bind(this)}>
          <calcite-label>
            Station id
            <calcite-input-text autocomplete="off" name="stationId" required></calcite-input-text>
          </calcite-label>
          <calcite-label>
            Station name
            <calcite-input-text autocomplete="off" name="stationName" required></calcite-input-text>
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
          Add
        </calcite-button>
      </calcite-dialog>
    );
  }

  //#endregion
}
