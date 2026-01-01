import './main.scss';
import './components/components';
import Loader from './components/Loader/Loader';
import MoneyTides from './components/MoneyTides/MoneyTides';
import DisclaimerDialog, { isAccepted } from './components/DisclaimerDialog/DisclaimerDialog';
import { applicationSettings } from './app-config';

applicationSettings.setColorMode();

// console.log(applicationSettings);

const loader = new Loader();

if (!isAccepted()) new DisclaimerDialog();

const moneyTides = new MoneyTides();

moneyTides.on('loaded', (): void => {
  loader.end();
});
