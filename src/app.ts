import '@esri/calcite-components/dist/calcite/calcite.css';
import '@arcgis/core/assets/esri/css/main.css';
import './main.scss';

import './components/components';
import Loader from './components/Loader';
import MoneyTides from './components/MoneyTides';
// import { applicationSettings } from './app-config';

// applicationSettings.setColorMode();

const loader = new Loader();

const moneyTides = new MoneyTides();

moneyTides.on('loaded', (): void => {
  loader.end();
});

// console.log(applicationSettings);
