import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';

export const getLayer = async (): Promise<__esri.GeoJSONLayer> => {
  const layer = new GeoJSONLayer({
    outFields: ['*'],
    url: './locations.json',
  });

  await layer.load();

  return layer;
};
