import '@esri/calcite-components/dist/calcite/calcite.css';
import '@arcgis/core/assets/esri/css/main.css';
import './main.scss';

import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import './components/components';
import Loader from './components/Loader';
import MoneyTides from './components/MoneyTides';
import config from './app-config';

// if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
//   document.body.classList.add('calcite-mode-dark');

const loader = new Loader();

const moneyTides = new MoneyTides({
  stationInfos: config.stationInfos,
  view: new MapView({
    constraints: {
      rotationEnabled: false,
    },
    extent: {
      spatialReference: {
        wkid: 102100,
      },
      xmin: -13927811,
      ymin: 5308864,
      xmax: -13626955,
      ymax: 5844535,
    },
    map: new Map({
      basemap: 'topo-vector',
    }),
  }),
});

moneyTides.on('loaded', (): void => {
  loader.end();
});
