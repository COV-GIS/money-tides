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

    // console.log(zoom, this.effect);

    // this.effect =
    //   zoom < 4
    //     ? null
    //     : zoom >= 4 && zoom < 6
    //       ? `blur(0.75px)`
    //       : zoom >= 6 && zoom < 8
    //         ? `blur(1.5px)`
    //         : zoom >= 8 && zoom < 10
    //           ? `blur(4px)`
    //           : zoom >= 10 && zoom < 12
    //             ? `blur(3px)`
    //             : zoom >= 12 && zoom < 14
    //               ? `blur(3.75px)`
    //               : zoom >= 14 && zoom < 16
    //                 ? `blur(4.5px)`
    //                 : zoom >= 16 && zoom < 18
    //                   ? `blur(5.25px)`
    //                   : `blur(6px)`;
  }
}
