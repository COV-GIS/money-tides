//#region modules

import './Loader.scss';
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

//#endregion

const CSS_BASE = 'loader';

const CSS = {
  loader: `${CSS_BASE}_loader`,
  text: `${CSS_BASE}_text`,
};

@subclass('Loader')
export default class Loader extends Widget {
  //#region lifecycle

  private _container = document.createElement('div');

  get container(): HTMLDivElement {
    return this._container;
  }

  set container(value: HTMLDivElement) {
    this._container = value;
  }

  constructor(properties?: __esri.WidgetProperties) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);
  }

  //#endregion

  //#region public methods

  public end(): void {
    const { container } = this;

    setTimeout((): void => {
      container.style.opacity = '0';
    }, 1000);

    setTimeout((): void => {
      document.body.removeChild(container);

      this.destroy();
    }, 2000);
  }

  //#endregion

  //#region render

  render(): tsx.JSX.Element {
    return (
      <div class={CSS_BASE}>
        <div class={CSS.text}>
          <div>Money</div>
          <div>Tides</div>
        </div>
        <calcite-loader class={CSS.loader} label="Loading money tides..."></calcite-loader>
      </div>
    );
  }

  //#endregion
}
