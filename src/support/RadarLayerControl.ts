import esri = __esri;
import type { MT } from '../interfaces';

import { watch, whenOnce } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Assessor from '@arcgis/core/core/Accessor';
import DateTime, { Interval } from '../utils/dateAndTimeUtils';

const BLUR_HANDLE = 'blur-handle';

const LOOP_HANDLE = 'loop-handle';

@subclass('RadarLayerControl')
export default class RadarLayerControl extends Assessor {
  constructor(properties: MT.RadarLayerControlProperties) {
    super(properties);

    this.initialize();
  }

  private async initialize(): Promise<void> {
    await whenOnce(() => this.view);

    const { blurEnabled, layer, loopEnabled, view } = this;

    await layer.load();

    this.setFullTimeExtent();

    this.addHandles(layer.on('refresh', this.setFullTimeExtent.bind(this)));

    // if (fullTimeExtent)
    //   this.timeRange = `${DateTime.fromJSDate(fullTimeExtent.start as Date)
    //     .setZone('America/Los_Angeles')
    //     .toFormat('L/d h:mm a')} - ${DateTime.fromJSDate(fullTimeExtent.end as Date)
    //     .setZone('America/Los_Angeles')
    //     .toFormat('L/d h:mm a')}`;

    if (blurEnabled) {
      this.blur(view.zoom);

      this.addHandles(
        watch((): number => view.zoom, this.blur.bind(this)),
        BLUR_HANDLE,
      );
    }

    this.addHandles(
      watch(
        (): boolean => this.blurEnabled,
        (_blurEnabled: boolean): void => {
          if (_blurEnabled) {
            this.blur(view.zoom);

            this.addHandles(
              watch((): number => view.zoom, this.blur.bind(this)),
              BLUR_HANDLE,
            );
          } else {
            layer.effect = null;

            this.removeHandles(BLUR_HANDLE);
          }
        },
      ),
    );

    if (layer.visible && loopEnabled) this.loop(true);

    if (loopEnabled)
      this.addHandles(
        watch((): boolean => layer.visible, this.loop.bind(this)),
        LOOP_HANDLE,
      );

    this.addHandles(
      watch(
        (): boolean => this.loopEnabled,
        (_loopEnabled: boolean): void => {
          if (_loopEnabled) {
            if (layer.visible) this.loop(true);

            this.addHandles(
              watch((): boolean => layer.visible, this.loop.bind(this)),
              LOOP_HANDLE,
            );
          } else {
            this.stop();

            this.removeHandles(LOOP_HANDLE);
          }
        },
      ),
    );
  }

  @property()
  public blurEnabled = true;

  public intervals = 20;

  public layer!: esri.ImageryLayer | esri.WMSLayer;

  @property()
  public loopEnabled = true;

  public rate = 250;

  public getTimeExtentText(): string {
    const { fullTimeExtent, loopEnabled } = this;

    if (!fullTimeExtent) return '';

    const start = DateTime.fromJSDate(fullTimeExtent.start as Date)
      .setZone('America/Los_Angeles')
      .toFormat('ccc h:mm a');

    const end = DateTime.fromJSDate(fullTimeExtent.end as Date)
      .setZone('America/Los_Angeles')
      .toFormat('ccc h:mm a');

    if (!loopEnabled) return start;

    return `${start} to ${end}`;
  }

  @property()
  public view!: esri.MapView;

  @property()
  public fullTimeExtent?: esri.TimeExtent;

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

  private setFullTimeExtent(): void {
    const timeInfo = this.layer.timeInfo;

    if (!timeInfo) return;

    this.fullTimeExtent = timeInfo.fullTimeExtent || undefined;
  }

  private stop(): void {
    const { layer, interval } = this;

    if (interval) clearInterval(interval);

    this.interval = null;

    layer.timeExtent = null;

    layer.refresh();
  }

  private start(): void {
    const { fullTimeExtent, intervals, layer, rate } = this;

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

      // this.timeRange = `${start.setZone('America/Los_Angeles').toFormat('L/d h:mm a')} - ${end
      //   .setZone('America/Los_Angeles')
      //   .toFormat('L/d h:mm a')}`;

      index++;
    }, rate);
  }
}
