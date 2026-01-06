//#region types

import { MT } from '../../interfaces';

//#endregion

//#region modules

import './GradientLegend.scss';
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

//#endregion

@subclass('GradientScale')
export default class GradientScale extends Widget {
  constructor(properties: MT.GradientScaleProperties) {
    super(properties);
  }

  override postInitialize(): void {
    this.gradientInfos.forEach((gradientInfo: MT.GradientInfo): void => {
      this.labels.push(<span>{gradientInfo.label}</span>);

      this.values.push(gradientInfo.value);
    });
  }

  public description = '';

  public gradientInfos!: MT.GradientInfo[];

  private labels: tsx.JSX.Element[] = [];

  private values: string[] = ['90deg'];

  override render(): tsx.JSX.Element {
    return (
      <div style="font-size: var(--calcite-font-size-xs);">
        <div style="width: 100%; display: flex; flex-direction: row; justify-content: space-between;">
          <div style="width: 0.125rem;"></div>
          <div style={`width: 100%; height: 16px; background: linear-gradient(${this.values.join(', ')});`}></div>
          <div style="width: 0.125rem;"></div>
        </div>
        <div style="display: flex; flex-direction: row; justify-content: space-between;">{this.labels}</div>
        <div style="width: 100%; text-align: center;">{this.description}</div>
      </div>
    );
  }
}
