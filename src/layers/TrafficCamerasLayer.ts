import esri = __esri;
type Feature = {
  attributes: { [key: string]: string | number | boolean | null };
  geometry: { x: number; y: number };
};
type Response = { features: Feature[]; spatialReference: { wkid: number } };

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { trafficCamera21 } from 'calcite-point-symbols/js/trafficCamera21';
import { applicationSettings, trafficExtent } from '../app-config';

const ID_FIELD = 'cameraId';

const LOAD_HANDLE = 'load-handle';

@subclass('TrafficCamerasLayer')
export default class TrafficCamerasLayer extends GraphicsLayer {
  constructor(properties?: esri.GraphicsLayerProperties) {
    super(properties);

    this.addHandles(
      watch(
        (): boolean => this.visible,
        (visble: boolean): void => {
          if (visble) {
            this.removeHandles(LOAD_HANDLE);

            this.loadGraphics();

            setInterval(this.updateAttributes.bind(this), 300000);
          }
        },
      ),
      LOAD_HANDLE,
    );
  }

  @property()
  override title = 'Traffic Cameras';

  @property()
  override visible = false;

  private async fetchData(): Promise<Response> {
    return await (await fetch('https://www.vernonia-or.gov/road-data/cameras/')).json();
  }

  private async loadGraphics(): Promise<void> {
    try {
      const { features, spatialReference } = await this.fetchData();

      const Point = (await import('@arcgis/core/geometry/Point')).default;

      const Graphic = (await import('@arcgis/core/Graphic')).default;

      const SimpleMarkerSymbol = (await import('@arcgis/core/symbols/SimpleMarkerSymbol')).default;

      const { accelerateGeometry, execute } = await import('@arcgis/core/geometry/operators/containsOperator');

      const { webMercatorToGeographic } = await import('@arcgis/core/geometry/support/webMercatorUtils');

      accelerateGeometry(trafficExtent);

      features.forEach((feature: Feature): void => {
        const {
          attributes,
          geometry: { x, y },
        } = feature;

        const point = webMercatorToGeographic(
          new Point({
            spatialReference,
            x,
            y,
          }),
        );

        if (!execute(trafficExtent, point)) return;

        this.addMany([
          new Graphic({
            attributes,
            geometry: point,
            symbol: new SimpleMarkerSymbol({
              style: 'circle',
              size: 13,
              color: 'white',
              outline: {
                color: 'black',
                width: 1,
              },
            }),
          }),
          new Graphic({
            attributes,
            geometry: point,
            symbol: new SimpleMarkerSymbol({
              style: 'circle',
              size: 7,
              color: 'black',
              outline: {
                width: 0,
              },
              path: trafficCamera21,
            }),
          }),
        ]);
      });
    } catch (error) {
      console.log(error);

      // TODO: error handling using classes error logic
    }
  }

  private async updateAttributes(): Promise<void> {
    try {
      const { features } = await this.fetchData();

      this.graphics.forEach((graphic: esri.Graphic): void => {
        const updateFeature = features.find((feature: Feature): boolean => {
          return graphic.attributes[ID_FIELD] === feature.attributes[ID_FIELD];
        });

        if (updateFeature) graphic.attributes = updateFeature.attributes;
      });
    } catch (error) {
      console.log(error);

      // TODO: error handling using classes error logic
    }
  }
}
