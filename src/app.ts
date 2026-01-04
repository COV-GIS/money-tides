import './main.scss';

const loadApp = async (): Promise<void> => {
  await import('./components/components');

  const { applicationSettings } = await import('./app-config');

  applicationSettings.load();

  const loader = new (await import('./components/Loader/Loader')).default();

  const DisclaimerDialog = (await import('./components/DisclaimerDialog/DisclaimerDialog')).default;

  if (!DisclaimerDialog.isAccepted()) new DisclaimerDialog();

  const moneyTides = new (await import('./components/MoneyTides/MoneyTides')).default();

  moneyTides.on('loaded', (): void => {
    loader.end();
  });
};

loadApp();
