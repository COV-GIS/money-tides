//#region types

import esri = __esri;

//#endregion

//#region modules

import './SettingsPopover.scss';
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { applicationSettings } from '../../app-config';

//#endregion

//#region constants

const CSS_BASE = 'settings-popover';

const CSS = {
  content: `${CSS_BASE}_content`,
};

//#endregion

@subclass('SettingsPopover')
export default class SettingsPopover extends Widget {
  //#region lifecycle

  private _container!: HTMLCalcitePopoverElement;

  get container(): HTMLCalcitePopoverElement {
    return this._container;
  }

  set container(value: HTMLCalcitePopoverElement) {
    this._container = value;
  }

  constructor(properties: esri.WidgetProperties & { referenceElementId: string }) {
    super(properties);
  }

  //#endregion

  //#region private properties

  private referenceElementId!: string;

  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    const { colorMode, scale } = applicationSettings;

    return (
      <calcite-popover
        auto-close=""
        class={CSS_BASE}
        closable
        heading="Settings"
        overlay-positioning="fixed"
        placement="leading"
        scale={scale}
        reference-element={this.referenceElementId}
      >
        <div class={CSS.content}>
          <calcite-label scale={scale}>
            Color mode
            <calcite-segmented-control
              appearance="solid"
              scale={scale}
              afterCreate={(segmentedControl: HTMLCalciteSegmentedControlElement): void => {
                segmentedControl.addEventListener('calciteSegmentedControlChange', (): void => {
                  applicationSettings.updateSettings({ colorMode: segmentedControl.selectedItem.value });
                });
              }}
            >
              <calcite-segmented-control-item checked={colorMode === 'auto'} scale={scale} value="auto">
                Auto
              </calcite-segmented-control-item>
              <calcite-segmented-control-item checked={colorMode === 'light'} scale={scale} value="light">
                Light
              </calcite-segmented-control-item>
              <calcite-segmented-control-item checked={colorMode === 'dark'} scale={scale} value="dark">
                Dark
              </calcite-segmented-control-item>
            </calcite-segmented-control>
          </calcite-label>
          <calcite-label scale={scale} style="--calcite-label-margin-bottom: 0;">
            Size
            <calcite-segmented-control
              scale={scale}
              afterCreate={(segmentedControl: HTMLCalciteSegmentedControlElement): void => {
                segmentedControl.addEventListener('calciteSegmentedControlChange', (): void => {
                  applicationSettings.updateSettings({ scale: segmentedControl.selectedItem.value });
                });
              }}
            >
              <calcite-segmented-control-item checked={scale === 'm'} scale={scale} value="m">
                Normal
              </calcite-segmented-control-item>
              <calcite-segmented-control-item checked={scale === 's'} scale={scale} value="s">
                Compact
              </calcite-segmented-control-item>
            </calcite-segmented-control>
          </calcite-label>
        </div>
      </calcite-popover>
    );
  }

  //#endregion
}
