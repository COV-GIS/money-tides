import esri = __esri;
type Feature = {
  attributes: { [key: string]: string | number | boolean | null };
  geometry: { x: number; y: number };
};
type FeatureSet = { features: Feature[]; spatialReference: { wkid: number } };
type Response = {
  cameraPoints: FeatureSet;
  eventLines: FeatureSet;
  eventPoints: FeatureSet;
  weatherRoadReportPoints: FeatureSet;
  weatherStationPoints: FeatureSet;
};

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { trafficCamera21 } from 'calcite-point-symbols/js/trafficCamera21';
import { trafficAccident21 } from 'calcite-point-symbols/js/trafficAccident21';
import { trafficCone21 } from 'calcite-point-symbols/js/trafficCone21';
import { warning21 } from 'calcite-point-symbols/js/warning21';
import { getDocumentStyle } from '../utils/colorUtils';
import { applicationSettings, trafficExtent, view } from '../app-config';

const LOAD_HANDLE = 'load-handle';

@subclass('TrafficLayers')
export default class TrafficLayers extends GroupLayer {
  constructor(properties?: esri.GroupLayerProperties) {
    super(properties);

    this.addHandles(
      watch(
        (): boolean => this.visible,
        (visble: boolean): void => {
          if (visble) {
            this.removeHandles(LOAD_HANDLE);

            this.loadData();

            this.trafficOverlay();

            setInterval(this.updateData.bind(this), 300000);
          }
        },
      ),
      LOAD_HANDLE,
    );

    const { cameras, events, weatherReoprts, weatherStations, eventLines } = this.graphicsLayers;

    this.addMany([eventLines, weatherStations, weatherReoprts, events, cameras]);
  }

  @property()
  override title = 'Traffic';

  @property()
  override visible = false;

  public graphicsLayers = {
    cameras: new Cameras({ minScale: 600000, title: 'Traffic Cameras' }),
    events: new Events({ minScale: 600000, title: 'Accidents, Construction and Closures' }),
    weatherReoprts: new GraphicsLayer({ minScale: 600000, title: 'Weather Reports' }),
    weatherStations: new GraphicsLayer({ minScale: 600000, title: 'Weather Stations' }),
    eventLines: new GraphicsLayer({ minScale: 600000, title: '' }),
  };

  private async fetchData(): Promise<Response> {
    return await (await fetch('https://www.vernonia-or.gov/road-data/')).json();
  }

  private async loadData(): Promise<void> {
    try {
      const response = await this.fetchData();

      console.log(response);

      const { cameras, events, weatherReoprts, weatherStations, eventLines } = this.graphicsLayers;

      cameras.addGraphics(response.cameraPoints);

      events.addGraphics(response.eventPoints);
    } catch (error) {
      console.log(error);

      // TODO: error handling
    }
  }

  private async updateData(): Promise<void> {
    try {
      const response = await this.fetchData();

      //   console.log(response);

      const { cameras, events, weatherReoprts, weatherStations, eventLines } = this.graphicsLayers;

      cameras.updateAttributes(response.cameraPoints);
    } catch (error) {
      console.log(error);

      // TODO: error handling
    }
  }

  private async trafficOverlay(): Promise<void> {
    const layer = new (await import('@arcgis/core/layers/TileLayer')).default({
      url: 'https://www.tripcheck.com/Basemaps/Pseudo.MapServer/Inrix/MapServer',
      visible: this.visible,
    });

    const map = view.map as esri.Map;

    map.layers.on('after-add', (): void => {
      if (map.layers.indexOf(layer) !== 0) map.reorder(layer, 0);
    });

    map.add(layer, 0);

    this.addHandles(
      watch(
        (): boolean => this.visible,
        (visible: boolean): void => {
          layer.visible = visible;
        },
      ),
    );
  }
}

@subclass('Cameras')
class Cameras extends GraphicsLayer {
  private idField = 'cameraId';

  private fields = [
    {
      name: 'cameraId',
      alias: 'Camera ID',
      type: 'esriFieldTypeInteger',
    },
    {
      name: 'publishedImageId',
      alias: 'Published Image ID',
      type: 'esriFieldTypeInteger',
    },
    {
      name: 'filename',
      alias: 'Filename',
      type: 'esriFieldTypeString',
      length: 255,
    },
    {
      name: 'iconType',
      alias: 'Icon Type',
      type: 'esriFieldTypeInteger',
    },
    {
      name: 'latitude',
      alias: 'Latitude',
      type: 'esriFieldTypeDouble',
    },
    {
      name: 'longitude',
      alias: 'Longitude',
      type: 'esriFieldTypeDouble',
    },
    {
      name: 'route',
      alias: 'Route Name',
      type: 'esriFieldTypeString',
      length: 6,
    },
    {
      name: 'title',
      alias: 'Title',
      type: 'esriFieldTypeString',
      length: 100,
    },
    {
      name: 'videoId',
      alias: 'Video ID',
      type: 'esriFieldTypeInteger',
    },
  ];

  public async addGraphics(data: FeatureSet): Promise<void> {
    const { features, spatialReference } = data;

    const Point = (await import('@arcgis/core/geometry/Point')).default;

    const Graphic = (await import('@arcgis/core/Graphic')).default;

    const SimpleMarkerSymbol = (await import('@arcgis/core/symbols/SimpleMarkerSymbol')).default;

    // const { accelerateGeometry, execute } = await import('@arcgis/core/geometry/operators/containsOperator');

    const { webMercatorToGeographic } = await import('@arcgis/core/geometry/support/webMercatorUtils');

    // accelerateGeometry(trafficExtent);

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

      //   if (!execute(trafficExtent, point)) return;

      const colors = this.getColors();

      this.addMany([
        new Graphic({
          attributes,
          geometry: point,
          symbol: new SimpleMarkerSymbol({
            style: 'circle',
            size: 13,
            color: colors.secondary,
            outline: {
              color: colors.primary,
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
            color: colors.primary,
            outline: {
              width: 0,
            },
            path: trafficCamera21,
          }),
        }),
      ]);
    });

    this.addHandles(watch(() => applicationSettings.colorType, this.updateSymbols.bind(this)));
  }

  public async updateAttributes(data: FeatureSet): Promise<void> {
    const { features } = data;

    this.graphics.forEach((graphic: esri.Graphic): void => {
      const updateFeature = features.find((feature: Feature): boolean => {
        return graphic.attributes[this.idField] === feature.attributes[this.idField];
      });

      if (updateFeature) graphic.attributes = updateFeature.attributes;
    });
  }

  private getColors(): { primary: string; secondary: string } {
    return applicationSettings.colorType === 'dark'
      ? { primary: 'white', secondary: 'black' }
      : { primary: 'black', secondary: 'white' };
  }

  private updateSymbols(): void {
    const colors = this.getColors();

    this.graphics.forEach((graphic: esri.Graphic): void => {
      const symbol = graphic.symbol?.clone() as esri.SimpleMarkerSymbol;

      if (symbol.path) {
        symbol.color = colors.primary;
      } else {
        symbol.color = colors.secondary;

        symbol.outline.color = colors.primary;
      }

      graphic.symbol = symbol;
    });
  }
}

@subclass('Events')
class Events extends GraphicsLayer {
  private fields = [
    {
      name: 'incidentId',
      alias: 'Incident ID',
      type: 'esriFieldTypeInteger',
    },
    {
      name: 'tocsIncidentId',
      type: 'esriFieldTypeInteger',
    },
    {
      name: 'type',
      alias: 'Event Type',
      type: 'esriFieldTypeString',
      length: 10,
    },
    {
      name: 'lastUpdated',
      alias: 'Last Updated',
      type: 'esriFieldTypeString',
      length: 19,
    },
    {
      name: 'startTime',
      alias: 'Start Time',
      type: 'esriFieldTypeString',
      length: 19,
    },
    {
      name: 'locationName',
      alias: 'Location Name',
      type: 'esriFieldTypeString',
      length: 50,
    },
    {
      name: 'route',
      alias: 'Route Name',
      type: 'esriFieldTypeString',
      length: 6,
    },
    {
      name: 'eventTypeId',
      alias: 'Event Type ID',
      type: 'esriFieldTypeString',
      length: 2,
    },
    {
      name: 'eventTypeName',
      alias: 'Event Type Name',
      type: 'esriFieldTypeString',
      length: 50,
    },
    {
      name: 'eventSubTypeId',
      alias: 'Event Sub Type ID',
      type: 'esriFieldTypeInteger',
    },
    {
      name: 'eventSubTypeName',
      alias: 'Event Sub Type Name',
      type: 'esriFieldTypeString',
      length: 50,
    },
    {
      name: 'odotCategoryID',
      alias: 'Category ID',
      type: 'esriFieldTypeString',
      length: 1,
    },
    {
      name: 'odotCategoryDescript',
      alias: 'Category Description',
      type: 'esriFieldTypeString',
      length: 50,
    },
    {
      name: 'odotSeverityID',
      alias: 'Severity ID',
      type: 'esriFieldTypeInteger',
    },
    {
      name: 'odotSeverityDescript',
      alias: 'Severity Description',
      type: 'esriFieldTypeString',
      length: 100,
    },
    {
      name: 'iconType',
      alias: 'Icon Type',
      type: 'esriFieldTypeInteger',
    },
    {
      name: 'beginMP',
      alias: 'Begin Milepost',
      type: 'esriFieldTypeInteger',
    },
    {
      name: 'beginMarker',
      alias: 'Begin Marker',
      type: 'esriFieldTypeString',
      length: 200,
    },
    {
      name: 'endMP',
      alias: 'End Milepost',
      type: 'esriFieldTypeInteger',
    },
    {
      name: 'endMarker',
      alias: 'End Marker',
      type: 'esriFieldTypeString',
      length: 200,
    },
    {
      name: 'startLatitude',
      alias: 'Start Latitude',
      type: 'esriFieldTypeDouble',
    },
    {
      name: 'startLongitude',
      alias: 'Start Longitude',
      type: 'esriFieldTypeDouble',
    },
    {
      name: 'endLatitude',
      alias: 'End Latitude',
      type: 'esriFieldTypeDouble',
    },
    {
      name: 'endLongitude',
      alias: 'End Longitude',
      type: 'esriFieldTypeDouble',
    },
    {
      name: 'incidentDirection',
      alias: 'Incdident Direction',
      type: 'esriFieldTypeString',
      length: 2,
    },
    {
      name: 'odotOffHwyCD',
      alias: 'Off Highway Code',
      type: 'esriFieldTypeString',
      length: 2,
    },
    {
      name: 'odotOffHwyDescription',
      alias: 'Off Highway Description',
      type: 'esriFieldTypeString',
      length: 50,
    },
    {
      name: 'publicContact',
      alias: 'Public Contact',
      type: 'esriFieldTypeString',
      length: 100,
    },
    {
      name: 'publiContactPhone',
      alias: 'Contact Phone',
      type: 'esriFieldTypeString',
      length: 20,
    },
    {
      name: 'infoUrl',
      alias: 'Info URL',
      type: 'esriFieldTypeString',
      length: 255,
    },
    {
      name: 'comments',
      alias: 'Comments',
      type: 'esriFieldTypeString',
      length: 255,
    },
    {
      name: 'tmdOther',
      alias: 'Other',
      type: 'esriFieldTypeString',
      length: 255,
    },
    {
      name: 'delayInfo',
      alias: 'Delay Info',
      type: 'esriFieldTypeString',
      length: 20,
    },
  ];

  private eventTypes = [
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
    'type: INCIDENT - type name: Vehicle Incident - subtype name: Disabled Vehicle - Hazard',
    'type: INCIDENT - type name: Obstruction - subtype name: Animal Struck - Hazard',
    'type: INCIDENT - type name: Disaster - subtype name: Fire',
    'type: INCIDENT - type name: Obstruction - subtype name: Hazardous Tree or Vegetation',
    'type: INCIDENT - type name: Weather Event - subtype name: Winter',
  ];

  public async addGraphics(data: FeatureSet): Promise<void> {
    const { features, spatialReference } = data;

    const Point = (await import('@arcgis/core/geometry/Point')).default;

    const Graphic = (await import('@arcgis/core/Graphic')).default;

    const SimpleMarkerSymbol = (await import('@arcgis/core/symbols/SimpleMarkerSymbol')).default;

    // const { accelerateGeometry, execute } = await import('@arcgis/core/geometry/operators/containsOperator');

    const { webMercatorToGeographic } = await import('@arcgis/core/geometry/support/webMercatorUtils');

    // accelerateGeometry(trafficExtent);

    features.forEach((feature: Feature): void => {
      const {
        attributes,
        attributes: { type, eventTypeName, eventSubTypeName },
        geometry: { x, y },
      } = feature;

      const eventType = `type: ${type} - type name: ${eventTypeName} - subtype name: ${eventSubTypeName}`;

      const eventTypesLength = this.eventTypes.length;

      if (this.eventTypes.indexOf(eventType) === -1) {
        this.eventTypes.push(eventType);

        console.log('New event type:', eventType);
      }

      if (eventTypesLength < this.eventTypes.length) {
        console.log('Upadted event types...');

        console.log(this.eventTypes);
      }

      const point = webMercatorToGeographic(
        new Point({
          spatialReference,
          x,
          y,
        }),
      );

      //   if (!execute(trafficExtent, point)) return;

      const colors = this.getColors(eventTypeName as string);

      const path =
        eventTypeName === 'Vehicle Incident'
          ? trafficAccident21
          : eventTypeName === 'Road Work'
            ? trafficCone21
            : warning21;

      this.addMany([
        new Graphic({
          attributes,
          geometry: point,
          symbol: new SimpleMarkerSymbol({
            style: 'circle',
            size: 13,
            color: colors.secondary,
            outline: {
              color: colors.primary,
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
            color: colors.primary,
            outline: {
              width: 0,
            },
            path,
          }),
        }),
      ]);
    });

    this.addHandles(watch(() => applicationSettings.colorType, this.updateSymbols.bind(this)));
  }

  //   public async updateAttributes(data: FeatureSet): Promise<void> {
  //     const { features } = data;

  //     this.graphics.forEach((graphic: esri.Graphic): void => {
  //       const updateFeature = features.find((feature: Feature): boolean => {
  //         return graphic.attributes[this.idField] === feature.attributes[this.idField];
  //       });

  //       if (updateFeature) graphic.attributes = updateFeature.attributes;
  //     });
  //   }

  private getColors(eventTypeName: string): { primary: string; secondary: string } {
    const color =
      eventTypeName === 'Vehicle Incident' || eventTypeName === 'Obstruction' || eventTypeName === 'Disaster'
        ? getDocumentStyle('--calcite-color-status-danger-press')
        : eventTypeName === 'Road Work'
          ? getDocumentStyle('--calcite-color-status-warning-press')
          : getDocumentStyle('--calcite-color-status-info-press');

    return applicationSettings.colorType === 'dark'
      ? { primary: 'white', secondary: color }
      : { primary: color, secondary: 'white' };
  }

  private updateSymbols(): void {
    this.graphics.forEach((graphic: esri.Graphic): void => {
      const symbol = graphic.symbol?.clone() as esri.SimpleMarkerSymbol;

      const colors = this.getColors(graphic.attributes.eventTypeName as string);

      if (symbol.path) {
        symbol.color = colors.primary;
      } else {
        symbol.color = colors.secondary;

        symbol.outline.color = colors.primary;
      }

      graphic.symbol = symbol;
    });
  }
}
