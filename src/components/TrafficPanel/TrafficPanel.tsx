//#region types

import esri = __esri;

//#endregion

//#region modules

import './TrafficPanel.scss';
import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import PanelBase from '../PanelBase';
import { tsx } from '@arcgis/core/widgets/support/widget';
// import Collection from '@arcgis/core/core/Collection';
// import TileLayer from '@arcgis/core/layers/TileLayer';
import Field from '@arcgis/core/layers/support/Field';
import Point from '@arcgis/core/geometry/Point';
import Polygon from '@arcgis/core/geometry/Polygon';
import Graphic from '@arcgis/core/Graphic';
// import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import { applicationSettings, trafficExtent, trafficLayer, view } from '../../app-config';
import { trafficCamera21 } from 'calcite-point-symbols/js/trafficCamera21';

//#endregion

//#region constants

const CSS_BASE = 'traffic-panel';

const CSS = {};

const LOAD_HANDLE = 'load-handle';

const OBJECTID_FIELD = 'money_tides_oid';

//#endregion

@subclass('AdvisoriesPanel')
export default class AdvisoriesPanel extends PanelBase {
  //#region lifecycle

  override async postInitialize(): Promise<void> {
    this.addHandles(
      watch(
        (): boolean => this.visible,
        (): void => {
          this.removeHandles(LOAD_HANDLE);

          this.load();
        },
      ),
      LOAD_HANDLE,
    );
  }

  //#endregion

  override hide(): void {
    this.visible = false;

    trafficLayer.visible = false;
  }

  override show(): void {
    this.visible = true;

    trafficLayer.visible = true;
  }

  //#region private properties
  //#endregion

  //#region private methods

  private async load(): Promise<void> {
    const TileLayer = (await import('@arcgis/core/layers/TileLayer')).default;

    const trafficFlow = new TileLayer({
      url: 'https://www.tripcheck.com/Basemaps/Pseudo.MapServer/Inrix/MapServer',
      visible: true,
    });

    try {
      const cameras = await this.loadCameras();

      // bottom to top
      trafficLayer.addMany([trafficFlow, cameras]);
    } catch (error) {
      console.log(error);
    }
  }

  private async loadCameras(): Promise<esri.GraphicsLayer> {
    const layer = new (await import('@arcgis/core/layers/GraphicsLayer')).default();

    const { accelerateGeometry, execute } = await import('@arcgis/core/geometry/operators/containsOperator');

    const { webMercatorToGeographic } = await import('@arcgis/core/geometry/support/webMercatorUtils');

    accelerateGeometry(trafficExtent);

    const { features, spatialReference } = await (await fetch('https://www.vernonia-or.gov/road-data/cameras/')).json();

    features.forEach(
      (feature: {
        attributes: { [key: string]: string | number | boolean | null };
        geometry: { x: number; y: number };
      }): void => {
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

        layer.addMany([
          new Graphic({
            attributes,
            geometry: point,
            symbol: new SimpleMarkerSymbol({
              style: 'circle',
              size: 12,
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
              size: 9,
              color: 'black',
              outline: {
                width: 0,
              },
              path: trafficCamera21,
            }),
          }),
        ]);
      },
    );

    return layer;
  }

  //#endregion

  //#region events
  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    const { scale } = applicationSettings;

    return (
      <calcite-panel heading="Traffic" scale={scale}>
        {this.closeAction()}
      </calcite-panel>
    );
  }

  //#endregion
}
