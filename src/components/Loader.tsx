//#region components

import '@esri/calcite-components/dist/components/calcite-loader';

//#endregion

//#region modules

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

//#endregion

@subclass('Loader')
export default class Loader extends Widget {
  //#region lifecycle

  private _container = document.createElement('calcite-loader');

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteLoaderElement) {
    this._container = value;
  }

  constructor(properties?: __esri.WidgetProperties) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this._container);
  }

  //#endregion

  //#region public methods

  public end(): void {
    const { container } = this;

    setTimeout((): void => {
      container.style.opacity = '0';
    }, 2000);

    setTimeout((): void => {
      document.body.removeChild(container);

      this.destroy();
    }, 3000);
  }

  //#endregion

  //#region render

  render(): tsx.JSX.Element {
    return (
      <calcite-loader
        label="Loading money tides..."
        style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 999; --calcite-loader-spacing: 0; background-color: var(--calcite-color-foreground-1); transition: opacity 1s;"
        text="Loading money tides..."
      ></calcite-loader>
    );
  }

  //#endregion
}
