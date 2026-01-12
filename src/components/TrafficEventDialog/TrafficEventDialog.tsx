import esri = __esri;

//#region modules

import './TrafficEventDialog.scss';
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import DateTime from '../../utils/dateAndTimeUtils';
import { applicationSettings } from '../../app-config';

//#endregion

//#region constants

const CSS_BASE = 'traffic-event-dialog';

//#endregion

@subclass('TrafficEventDialog')
export default class TrafficEventDialog extends Widget {
  //#region lifecycle

  private _container!: HTMLCalciteDialogElement;

  get container(): HTMLCalciteDialogElement {
    return this._container;
  }

  set container(value: HTMLCalciteDialogElement) {
    this._container = value;
  }

  //#endregion

  //#region private properties

  private attributes: esri.Graphic['attributes'] = {};

  //#endregion

  //#region public methods

  close(): void {
    this.container.open = false;
  }

  open(attributes: esri.Graphic['attributes']): void {
    this.attributes = attributes;

    console.log(attributes);

    this.renderNow();

    this.container.open = true;
  }

  //#endregion

  private toProperCase(value: string): string {
    value = value.toLowerCase();

    const words = value.split(' ');

    const proper = words.map((word: string): string => {
      if (word.length > 0) {
        const first = word.charAt(0).toUpperCase();

        const rest = word.slice(1);

        return first + rest;
      }

      return word;
    });

    return proper.join(' ');
  }

  //#region render

  override render(): tsx.JSX.Element {
    const {
      attributes: { beginMP, comments, endMP, eventSubTypeName, lastUpdated, route },
    } = this;

    const mileposts =
      beginMP === endMP ? (
        <div>Milepost {beginMP}</div>
      ) : (
        <div>
          Milepsost {beginMP} to {endMP}
        </div>
      );

    return (
      <calcite-dialog
        class={CSS_BASE}
        heading={this.toProperCase(eventSubTypeName)}
        placement={`bottom-${applicationSettings.layout === 'end' ? 'start' : 'end'}`}
        scale={applicationSettings.scale}
      >
        <div>
          <div>Route {route}</div>
          {mileposts}
          <div>{comments}</div>
          <div>
            {DateTime.fromISO(lastUpdated).setZone('America/Los_Angeles').toLocaleString(DateTime.DATETIME_FULL)}
          </div>
        </div>
      </calcite-dialog>
    );
  }

  //#endregion
}
