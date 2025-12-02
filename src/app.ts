import '@esri/calcite-components/dist/calcite/calcite.css';
import '@arcgis/core/assets/esri/css/main.css';
import './Application.scss';

import Application from './Application';

const load = async (): Promise<void> => {
  new Application({
    stations: [
      9437908, // nehalem
      9436101, // siletz
      9435385, // yaquine
    ],
    locations: [
      {
        station: 9437908,
        name: 'Nehalem, OR',
        latitude: 45.686923,
        longitude: -123.929533,
      },
      {
        station: 9436101,
        name: 'Taft, Siletz Bay, OR',
        latitude: 44.922025,
        longitude: -124.02262,
      },
      {
        station: 9435385,
        name: 'Yaquina USCG Station, Newport, OR',
        latitude: 44.62743,
        longitude: -124.04549,
      },
      {
        station: 9434132,
        name: 'Siuslaw River Entrance, OR',
        latitude: 43.97056,
        longitude: -124.1215,
      },
      {
        station: 9432845,
        name: 'Coos Bay, OR',
        latitude: 43.40168,
        longitude: -124.2795,
      },
      {
        station: 9432373,
        name: 'Bandon, Coquille River, OR',
        latitude: 43.1448,
        longitude: -124.40564,
      },
      {
        station: 9433501,
        name: 'Reedsport, OR',
        latitude: 43.7212,
        longitude: -124.15879,
      },
      {
        station: 9434939,
        name: 'Waldport, Alsea Bay',
        latitude: 43.7212,
        longitude: -124.15879,
      },
    ],
  });
};

load();
const x = {
  count: 1,
  units: null,
  stations: [
    {
      tidal: true,
      greatlakes: false,
      shefcode: null,
      details: {
        id: '9434939',
        established: '1933-03-14 00:00:00',
        removed: '2013-10-13 23:59:00',
        noaachart: '18561',
        timemeridian: -120,
        timezone: -8.0,
        origyear: '2013-05-18 00:00:00',
        self: 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/9434939/details.json',
      },
      sensors: {
        self: 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/9434939/sensors.json',
      },
      floodlevels: {
        self: 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/9434939/floodlevels.json',
      },
      datums: {
        self: 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/9434939/datums.json',
      },
      supersededdatums: {
        self: 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/9434939/supersededdatums.json',
      },
      harmonicConstituents: {
        self: 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/9434939/harcon.json',
      },
      benchmarks: {
        self: 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/9434939/benchmarks.json',
      },
      tidePredOffsets: {
        self: 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/9434939/tidepredoffsets.json',
      },
      ofsMapOffsets: {
        self: 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/9434939/ofsmapoffsets.json',
      },
      state: 'OR',
      timezone: 'PST',
      timezonecorr: -8,
      observedst: true,
      stormsurge: false,
      nearby: {
        self: 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/9434939/nearby.json',
      },
      forecast: false,
      outlook: false,
      HTFhistorical: false,
      HTFmonthly: false,
      nonNavigational: false,
      id: '9434939',
      name: 'Waldport',
      lat: 44.43436,
      lng: -124.05808,
      affiliations: 'VDatum',
      portscode: null,
      products: {
        self: 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/9434939/products.json',
      },
      disclaimers: {
        self: 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/9434939/disclaimers.json',
      },
      notices: {
        self: 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/9434939/notices.json',
      },
      self: 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/9434939.json',
      expand: 'details,sensors,floodlevels,datums,harcon,tidepredoffsets,ofsmapoffsets,products,disclaimers,notices',
      tideType: 'Mixed',
    },
  ],
  self: null,
};
