import esri = __esri;
type Feature = {
  attributes: { [key: string]: string | number | boolean | null };
  geometry: { x: number; y: number };
};
type Response = {
  lines: { features: Feature[]; spatialReference: { wkid: number } };
  points: { features: Feature[]; spatialReference: { wkid: number } };
};

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { trafficAccident21 } from 'calcite-point-symbols/js/trafficAccident21';
import { applicationSettings, trafficExtent } from '../app-config';

// const ID_FIELD = 'cameraId';

const EVENT_LINE_TYPES = [
  'type: EVENT - type name: Road Work - subtype name: Bridge Work',
  'type: INCIDENT - type name: Miscellaneous - subtype name: Closure',
  'type: INCIDENT - type name: Obstruction - subtype name: Landslide',
  'type: INCIDENT - type name: Miscellaneous - subtype name: Long-term ATIS',
];

const EVENT_POINT_TYPES = [
  'type: EVENT - type name: Road Work - subtype name: Road Construction',
  'type: EVENT - type name: Road Work - subtype name: Utility Work',
  'type: EVENT - type name: Road Work - subtype name: Road Maintenance Operations',
  'type: EVENT - type name: Road Work - subtype name: Bridge Work',
  'type: INCIDENT - type name: Obstruction - subtype name: Road Surface Collapse',
  'type: INCIDENT - type name: Obstruction - subtype name: SUNKEN GRADE',
  'type: INCIDENT - type name: Obstruction - subtype name: Hazardous Debris',
  'type: INCIDENT - type name: Obstruction - subtype name: Landslide',
  'type: INCIDENT - type name: Obstruction - subtype name: Animal on Roadway',
  'type: INCIDENT - type name: Obstruction - subtype name: Rock fall',
  'type: INCIDENT - type name: Obstruction - subtype name: High-water',
  'type: INCIDENT - type name: Vehicle Incident - subtype name: Crash',
  'type: INCIDENT - type name: Miscellaneous - subtype name: Closure',
  'type: INCIDENT - type name: Vehicle Incident - subtype name: Hazmat Cleanup',
  'type: INCIDENT - type name: Devices - subtype name: RR Xing Equipment Failure',
  'type: INCIDENT - type name: Miscellaneous - subtype name: Rest area',
  'type: INCIDENT - type name: Miscellaneous - subtype name: Long-term ATIS',
  'type: INCIDENT - type name: Road Work - subtype name: Controlled Burn',
  'type: INCIDENT - type name: Obstruction - subtype name: Erosion',
  'type: INCIDENT - type name: Weather Event - subtype name: Chain Condition',
];

const LOAD_HANDLE = 'load-handle';

@subclass('RoadIncidentsEventsLayer')
export default class RoadIncidentsEventsLayer extends GraphicsLayer {
  constructor(properties?: esri.GraphicsLayerProperties) {
    super(properties);

    this.addHandles(
      watch(
        (): boolean => this.visible,
        (visble: boolean): void => {
          if (visble) {
            this.removeHandles(LOAD_HANDLE);

            this.loadGraphics();
          }
        },
      ),
      LOAD_HANDLE,
    );
  }

  @property()
  override title = 'Road Construction and Closures';

  @property()
  override visible = false;

  private async fetchData(): Promise<Response> {
    return await (await fetch('https://www.vernonia-or.gov/road-data/')).json();
  }

  private async loadGraphics(): Promise<void> {
    const response = await this.fetchData();

    console.log(response);
  }

  private async _loadGraphics(): Promise<void> {
    try {
      const { lines, points } = await this.fetchData();

      const spatialReference = lines.spatialReference;

      /**
       * Retain for future dev
       */
      // lines.features.forEach((f) => {
      //   const x = `type: ${f.attributes.type} - type name: ${f.attributes.eventTypeName} - subtype name: ${f.attributes.eventSubTypeName}`;

      //   if (EVENT_LINE_TYPES.indexOf(x) === -1) {
      //     EVENT_LINE_TYPES.push(x);
      //     console.log(x);
      //   }
      // });

      // console.log(EVENT_LINE_TYPES);

      // points.features.forEach((f) => {
      //   const x = `type: ${f.attributes.type} - type name: ${f.attributes.eventTypeName} - subtype name: ${f.attributes.eventSubTypeName}`;

      //   if (EVENT_POINT_TYPES.indexOf(x) === -1) {
      //     EVENT_POINT_TYPES.push(x);
      //     console.log(x);
      //   }
      // });

      // console.log(EVENT_POINT_TYPES);

      const Point = (await import('@arcgis/core/geometry/Point')).default;

      const Graphic = (await import('@arcgis/core/Graphic')).default;

      const SimpleMarkerSymbol = (await import('@arcgis/core/symbols/SimpleMarkerSymbol')).default;

      const { accelerateGeometry, execute } = await import('@arcgis/core/geometry/operators/containsOperator');

      const { webMercatorToGeographic } = await import('@arcgis/core/geometry/support/webMercatorUtils');

      accelerateGeometry(trafficExtent);

      points.features.forEach((feature: Feature): void => {
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
                color: 'orange',
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
              color: 'orange',
              outline: {
                width: 0,
              },
              path: trafficAccident21,
            }),
          }),
        ]);
      });
    } catch (error) {
      console.log(error);

      // TODO: error handling using classes error logic
    }
  }
}
