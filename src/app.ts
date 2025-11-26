import '@esri/calcite-components/dist/calcite/calcite.css';
import '@arcgis/core/assets/esri/css/main.css';
import './Application.scss';

import Application from './Application';

const load = async (): Promise<void> => {
  new Application();
};

load();
