import '@esri/calcite-components/dist/calcite/calcite.css';
import '@arcgis/core/assets/esri/css/main.css';
import './main.scss';

import MoneyTides from './components/MoneyTides';

new MoneyTides({
  stationInfos: [
    {
      stationId: 9434939,
      stationName: 'Alsea Bay',
    },
    {
      stationId: 9430104,
      stationName: 'Chetco River',
    },
    {
      stationId: 9432845,
      stationName: 'Coos Bay',
    },
    {
      stationId: 9432373,
      stationName: 'Coquille River',
    },
    {
      stationId: 9437908,
      stationName: 'Nehalem Bay',
    },
    {
      stationId: 'TWC0857',
      stationName: 'Nestucca Bay',
    },
    {
      stationId: 9437262,
      stationName: 'Netarts Bay',
    },
    {
      stationId: 9431011,
      stationName: 'Rouge River',
    },
    {
      stationId: 9436101,
      stationName: 'Siletz Bay',
    },
    {
      stationId: 9434132,
      stationName: 'Siuslaw River',
    },
    {
      stationId: 9437585,
      stationName: 'Tillamook Bay',
    },
    {
      stationId: 9433501,
      stationName: 'Winchester Bay',
    },
    {
      stationId: 9435385,
      stationName: 'Yaquina Bay',
    },
    {
      stationId: 9435827,
      stationName: 'Depoe Bay',
    },
  ],
});
