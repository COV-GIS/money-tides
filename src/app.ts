import '@esri/calcite-components/dist/calcite/calcite.css';
import '@arcgis/core/assets/esri/css/main.css';
import './main.scss';

import './components/components';
import Loader from './components/Loader';
import MoneyTides from './components/MoneyTides';

// if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
//   document.body.classList.add('calcite-mode-dark');

const loader = new Loader();

const moneyTides = new MoneyTides();

moneyTides.on('loaded', (): void => {
  loader.end();
});
