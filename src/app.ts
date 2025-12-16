import '@esri/calcite-components/dist/calcite/calcite.css';
import '@arcgis/core/assets/esri/css/main.css';
import './main.scss';

import Loader from './components/Loader';
import MoneyTides from './components/MoneyTides';

const loader = new Loader();

const moneyTides = new MoneyTides({
  stationInfos: [
    {
      id: '9434939',
      latitude: 44.434,
      longitude: -124.058,
      name: 'Alsea Bay',
    },
    {
      id: '9439040',
      latitude: 46.207,
      longitude: -123.768,
      name: 'Astoria',
    },
    {
      id: '9430104',
      latitude: 42.043,
      longitude: -124.285,
      name: 'Chetco River',
    },
    {
      id: '9432845',
      latitude: 43.38,
      longitude: -124.215,
      name: 'Coos Bay',
    },
    {
      id: '9432373',
      latitude: 43.12,
      longitude: -124.413,
      name: 'Coquille River',
    },
    {
      id: '9435827',
      latitude: 44.81,
      longitude: -124.058,
      name: 'Depoe Bay',
    },
    {
      id: '9437908',
      latitude: 45.71,
      longitude: -123.89,
      name: 'Nehalem Bay',
    },
    {
      id: 'TWC0857',
      latitude: 45.167,
      longitude: -123.967,
      name: 'Nestucca Bay',
    },
    {
      id: '9437262',
      latitude: 45.43,
      longitude: -123.945,
      name: 'Netarts Bay',
    },
    {
      id: '9431011',
      latitude: 42.422,
      longitude: -124.419,
      name: 'Rouge River',
    },
    {
      id: '9436101',
      latitude: 44.927,
      longitude: -124.013,
      name: 'Siletz Bay',
    },
    {
      id: '9434132',
      latitude: 44.017,
      longitude: -124.13,
      name: 'Siuslaw River',
    },
    {
      id: '9437585',
      latitude: 45.57,
      longitude: -123.965,
      name: 'Tillamook Bay',
    },
    {
      id: '9440747',
      latitude: 46.502,
      longitude: -124.023,
      name: 'Willapa Bay',
    },
    {
      id: '9433501',
      latitude: 43.708,
      longitude: -124.098,
      name: 'Winchester Bay',
    },
    {
      id: '9435385',
      latitude: 44.627,
      longitude: -124.055,
      name: 'Yaquina Bay',
    },
  ],
});

moneyTides.on('loaded', (): void => {
  loader.end();
});
