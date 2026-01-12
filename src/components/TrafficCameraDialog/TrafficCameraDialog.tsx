//#region modules

import './TrafficCameraDialog.scss';
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { applicationSettings } from '../../app-config';

//#endregion

//#region constants

const CSS_BASE = 'traffic-camera-dialog';

const CSS = {
  imageContainer: `${CSS_BASE}_image-container`,
};

//#endregion

@subclass('TrafficCameraDialog')
export default class TrafficCameraDialog extends Widget {
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

  private filename = '';

  private title = '';

  //#endregion

  //#region public methods

  close(): void {
    this.container.open = false;
  }

  open(filename: string, title: string): void {
    this.filename = filename;

    this.title = title;

    this.renderNow();

    this.container.open = true;
  }

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    const { filename, title } = this;

    return (
      <calcite-dialog
        class={CSS_BASE}
        heading={title}
        placement={`bottom-${applicationSettings.layout === 'end' ? 'start' : 'end'}`}
        scale={applicationSettings.scale}
        width="s"
      >
        <div class={CSS.imageContainer}>
          <img alt={title} src={`https://tripcheck.com/RoadCams/cams/${filename}?rand=${new Date().getTime()}`}></img>
        </div>
      </calcite-dialog>
    );
  }

  //#endregion
}
