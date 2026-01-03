import esri = __esri;
import { MT } from '../interfaces';
import type { DurationLikeObject } from 'luxon';

import { whenOnce } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Assessor from '@arcgis/core/core/Accessor';
import TimeExtent from '@arcgis/core/time/TimeExtent';
import DateTime, { Duration, Interval } from '../utils/dateAndTimeUtils';

@subclass('LayerLoopController')
export default class LayerLoopController extends Assessor {
  constructor(properties: MT.LayerLoopControllerProperties) {
    super(properties);

    this.initialize();
  }

  private async initialize(): Promise<void> {
    await whenOnce((): esri.Layer => this.layer);

    const layer = this.layer as esri.Layer & {
      on(name: 'refresh', eventHandler: () => void): IHandle;
      refresh?: () => void;
    };

    await layer.load();

    this.loop();

    if (layer.refresh)
      this.addHandles(
        layer.on('refresh', (): void => {
          clearInterval(this.interval);

          this.timeExtent = null;

          this.loop();
        }),
      );
  }

  public duration: DurationLikeObject = { minutes: 15 };

  public layer!: esri.Layer;

  public speed = 400;

  @property({ aliasOf: 'layer.timeInfo.fullTimeExtent' })
  private fullTimeExtent?: esri.TimeExtent;

  @property({ aliasOf: 'layer.timeExtent' })
  private timeExtent: esri.TimeExtent | nullish;

  private interval?: number;

  private loop(): void {
    const { duration, fullTimeExtent, speed } = this;

    if (!fullTimeExtent) return;

    const startJS = fullTimeExtent.start;

    const endJS = fullTimeExtent.end;

    if (!startJS || !endJS) return;

    const startExtent = DateTime.fromJSDate(startJS);

    const endExtent = DateTime.fromJSDate(endJS);

    const timeIntervals = Interval.fromDateTimes(startExtent, endExtent).splitBy(Duration.fromObject(duration));

    let index = 0;

    this.interval = setInterval((): void => {
      if (timeIntervals.length === index + 1) index = 0;

      const { end, start } = timeIntervals[index] as Interval;

      if (!end || !start) {
        clearInterval(this.interval);

        this.timeExtent = null;

        return;
      }

      this.timeExtent = new TimeExtent({
        start: start.toJSDate(),
        end: end.toJSDate(),
      });

      index++;
    }, speed);
  }
}
