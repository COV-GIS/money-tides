import esri = __esri;

import type { DateTime } from 'luxon';
import type { _Location } from './Application';

import '@esri/calcite-components/dist/components/calcite-dialog';

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

// import { COLORS } from './Application';

@subclass('Dialog')
export default class Dialog extends Widget {
  private _container = document.createElement('calcite-dialog');

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteDialogElement) {
    this._container = value;
  }

  constructor(properties?: esri.WidgetProperties) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);
  }

  // @property()
  date!: DateTime;

  // @property()
  location!: _Location;

  show(location: _Location, date: DateTime): void {
    this.location = location;

    this.date = date;

    this.renderNow();

    this.container.open = true;
  }

  render(): tsx.JSX.Element {
    const { location } = this;

    if (!location) return <calcite-dialog></calcite-dialog>;

    const { money } = location;

    const kind = money === 0 ? 'danger' : money === 1 ? 'warning' : 'success';

    return (
      <calcite-dialog heading={location.name} kind={kind} modal>
        Hi!!!
      </calcite-dialog>
    );
  }
}
