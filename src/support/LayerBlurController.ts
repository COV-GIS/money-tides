import esri = __esri;
import { MT } from '../interfaces';

import { watch, whenOnce } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Assessor from '@arcgis/core/core/Accessor';

@subclass('LayerBlurController')
export default class LayerBlurController extends Assessor {
  constructor(properties: MT.LayerBlurControllerProperties) {
    super(properties);

    this.initialize();
  }

  private async initialize(): Promise<void> {
    await whenOnce((): esri.Layer => this.layer);

    const { view } = this;

    this.blur(view.zoom);

    this.addHandles(watch((): number => view.zoom, this.blur.bind(this)));
  }

  public layer!: esri.Layer;

  public view!: esri.MapView;

  @property({ aliasOf: 'layer.effect' })
  private effect: esri.Effect | nullish;

  private blur(zoom: number): void {
    if (zoom <= 0) {
      this.effect = null;

      return;
    }

    this.effect = `blur(${Math.floor(Math.log(zoom) * 3)}px)`;
  }
}
