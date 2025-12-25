import { MT } from './interfaces';

export default {
  weatherLayers: [
    {
      type: 'wms',
      properties: {
        opacity: 0.5,
        refreshInterval: 10,
        title: 'Wave Height',
        url: 'https://mapservices.weather.noaa.gov/geoserver/ndfd/waveh/ows?service=wms&version=1.3.0&request=GetCapabilities',
        visible: false,
      },
    },
    {
      type: 'wms',
      properties: {
        opacity: 0.8,
        refreshInterval: 1,
        title: 'Base Reflectivity Radar',
        url: 'https://opengeo.ncep.noaa.gov/geoserver/conus/conus_bref_qcd/ows?service=wms&version=1.3.0&request=GetCapabilities',
        visible: false,
      },
      radarLayerControlProperties: {},
    },
    {
      type: 'wms',
      properties: {
        opacity: 0.8,
        refreshInterval: 1,
        title: 'Composite Radar',
        url: 'https://opengeo.ncep.noaa.gov/geoserver/conus/conus_cref_qcd/ows?service=wms&version=1.3.0&request=GetCapabilities',
        visible: false,
      },
      radarLayerControlProperties: {},
    },
    {
      type: 'wms',
      properties: {
        opacity: 0.75,
        refreshInterval: 1,
        title: 'Cloud Cover',
        url: 'https://mapservices.weather.noaa.gov/geoserver/ndfd/sky/ows?service=wms&version=1.3.0&request=GetCapabilities',
        visible: false,
      },
      radarLayerControlProperties: { intervals: 10, rate: 1000 },
    },
    {
      type: 'map-image',
      properties: {
        sublayers: [
          {
            id: 1,
          },
          {
            id: 2,
          },
        ],
        title: 'Weather Fronts',
        url: 'https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/natl_fcst_wx_chart/MapServer',
        visible: false,
      },
    },
  ] as MT.WeatherLayer[],
  stationInfos: [
    {
      id: '9434939',
      latitude: 44.434,
      longitude: -124.058,
      name: 'Alsea Bay',
      weather: 'us/or/waldport',
    },
    {
      id: '9439040',
      latitude: 46.207,
      longitude: -123.768,
      name: 'Astoria',
      weather: 'us/or/astoria',
    },
    {
      id: '9430104',
      latitude: 42.043,
      longitude: -124.285,
      name: 'Chetco River',
      weather: 'us/or/brookings',
    },
    {
      id: '9432845',
      latitude: 43.38,
      longitude: -124.215,
      name: 'Coos Bay',
      weather: 'us/or/coos-bay',
    },
    {
      id: '9432373',
      latitude: 43.12,
      longitude: -124.413,
      name: 'Coquille River',
      weather: 'us/or/bandon',
    },
    {
      id: '9435827',
      latitude: 44.81,
      longitude: -124.058,
      name: 'Depoe Bay',
      weather: 'us/or/depoe-bay',
    },
    {
      id: '9437908',
      latitude: 45.71,
      longitude: -123.89,
      name: 'Nehalem Bay',
      weather: 'us/or/wheeler',
    },
    {
      id: 'TWC0857',
      latitude: 45.167,
      longitude: -123.967,
      name: 'Nestucca Bay',
      weather: 'us/or/pacific-city',
    },
    {
      id: '9437262',
      latitude: 45.43,
      longitude: -123.945,
      name: 'Netarts Bay',
      weather: 'us/or/netarts',
    },
    {
      id: '9431011',
      latitude: 42.422,
      longitude: -124.419,
      name: 'Rouge River',
      weather: 'us/or/gold-beach',
    },
    {
      id: '9436101',
      latitude: 44.927,
      longitude: -124.013,
      name: 'Siletz Bay',
      weather: 'us/or/lincoln-city',
    },
    {
      id: '9434132',
      latitude: 44.017,
      longitude: -124.13,
      name: 'Siuslaw River',
      weather: 'us/or/florence',
    },
    {
      id: '9437585',
      latitude: 45.57,
      longitude: -123.965,
      name: 'Tillamook Bay',
      weather: 'us/or/garibaldi',
    },
    {
      id: '9440747',
      latitude: 46.502,
      longitude: -124.023,
      name: 'Willapa Bay',
      weather: 'us/wa/long-beach',
    },
    {
      id: '9433501',
      latitude: 43.708,
      longitude: -124.098,
      name: 'Winchester Bay',
      weather: 'us/or/winchester-bay',
    },
    {
      id: '9435385',
      latitude: 44.627,
      longitude: -124.055,
      name: 'Yaquina Bay',
      weather: 'us/or/newport',
    },
  ] as MT.StationInfo[],
};
