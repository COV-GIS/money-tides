import esri = __esri;
import type { MT } from '../interfaces';

import { watch } from '@arcgis/core/core/reactiveUtils';
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Assessor from '@arcgis/core/core/Accessor';
import DateTime, { Interval } from '../utils/dateAndTimeUtils';

@subclass('RadarLayerControl')
export default class RadarLayerControl extends Assessor {
  constructor(properties: MT.RadarLayerControlProperties) {
    super(properties);

    const { layer, view } = properties;

    layer.effect = `blur(${view.zoom * 2}px)`;

    if (layer.visible) this.loop(true);

    this.addHandles([
      watch((): boolean => layer.visible, this.loop.bind(this)),
      watch((): number => view.zoom, this.blur.bind(this)),
    ]);
  }

  public intervals = 20;

  public layer!: esri.ImageryLayer | esri.WMSLayer;

  public rate = 250;

  public view!: esri.MapView;

  private interval: number | null = null;

  private blur(zoom: number): void {
    // TODO: create blur value for each zoom level
    const blur = zoom < 10 ? zoom * 2 : zoom * 4;

    this.layer.effect = `blur(${blur}px)`;
  }

  private loop(visible: boolean): void {
    if (visible) {
      this.start();
    } else {
      this.stop();
    }

    // what is wrong with TS???
    // visible ? this.start() : this.stop();
  }

  private stop(): void {
    const { layer, interval } = this;

    if (interval) clearInterval(interval);

    this.interval = null;

    layer.timeExtent = null;

    layer.refresh();
  }

  private start(): void {
    const { intervals, layer, rate } = this;

    const timeInfo = layer.timeInfo;

    if (!timeInfo) return;

    const fullTimeExtent = timeInfo.fullTimeExtent;

    if (!fullTimeExtent) return;

    const timeIntervals = Interval.fromDateTimes(
      DateTime.fromJSDate(fullTimeExtent.start as Date),
      DateTime.fromJSDate(fullTimeExtent.end as Date),
    ).divideEqually(intervals);

    let index = 0;

    this.interval = setInterval((): void => {
      if (timeIntervals.length === index) index = 0;

      const { end, start } = timeIntervals[index] as Interval;

      if (!end || !start) {
        this.stop();

        return;
      }

      layer.timeExtent = {
        start: start.toJSDate(),
        end: end.toJSDate(),
      };

      index++;
    }, rate);
  }
}
