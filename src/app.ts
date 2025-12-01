import '@esri/calcite-components/dist/calcite/calcite.css';
import '@arcgis/core/assets/esri/css/main.css';
import './Application.scss';

import Application from './Application';

const load = async (): Promise<void> => {
  new Application({
    locations: [
      {
        station: 9437908,
        name: 'Nehalem Bay',
        latitude: 45.686923,
        longitude: -123.929533,
      },
      {
        station: 9436101,
        name: 'Siletz Bay',
        latitude: 44.922025,
        longitude: -124.02262,
      },
      {
        station: 9435385,
        name: 'Yaquina Bay',
        latitude: 44.62743,
        longitude: -124.04549,
      },
    ],
  });
};

load();
