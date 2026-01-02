type ApplicationSettingsColorMode = 'auto' | 'dark' | 'light';
type ApplicationSettingsScale = 's' | 'm';

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Assessor from '@arcgis/core/core/Accessor';
import DateTime, { setNoon } from '../utils/dateAndTimeUtils';
import Cookies from 'js-cookie';

const COOKIE = 'money-tides-user-settings';

@subclass('ApplicationSettings')
export default class ApplicationSettings extends Assessor {
  @property()
  public basemap: 'dark-gray-vector' | 'gray-vector' = 'gray-vector';

  @property()
  public colorMode: ApplicationSettingsColorMode = 'auto';

  @property()
  public colorType: Omit<ApplicationSettingsColorMode, 'auto'> = 'light';

  @property()
  public date = setNoon(DateTime.now().setZone('America/Los_Angeles'));

  @property()
  layout: 'end' | 'start' = 'end';

  private preferredColorMode: ApplicationSettingsColorMode =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  @property()
  public scale: ApplicationSettingsScale = 's';

  public load(): void {
    const settings = JSON.parse(Cookies.get(COOKIE) || '{}');

    const { colorMode, scale } = settings;

    if (colorMode) this.colorMode = colorMode;

    this.colorModeUpdate(this.colorMode);

    if (scale) this.scale = scale;
  }

  public updateSettings(settings: {
    colorMode?: ApplicationSettingsColorMode;
    scale?: ApplicationSettingsScale;
  }): void {
    const { colorMode, scale } = settings;

    if (colorMode) {
      this.colorMode = colorMode;

      this.colorModeUpdate(this.colorMode);
    }

    if (scale) this.scale = scale;

    Cookies.set(
      COOKIE,
      JSON.stringify({
        colorMode: this.colorMode,
        scale: this.scale,
      }),
    );
  }

  private colorModeUpdate(mode: ApplicationSettingsColorMode): void {
    if (mode === 'auto') {
      this.colorType = this.preferredColorMode;

      this.basemap = this.preferredColorMode === 'light' ? 'gray-vector' : 'dark-gray-vector';
    } else {
      this.colorType = mode;

      this.basemap = mode === 'light' ? 'gray-vector' : 'dark-gray-vector';
    }

    document.body.classList.remove('calcite-mode-dark');

    document.body.classList.remove('calcite-mode-light');

    document.body.classList.add(`calcite-mode-${mode === 'auto' ? this.preferredColorMode : mode}`);

    const themeColor = document.querySelector('meta[name="theme-color"]');

    if (themeColor) themeColor.setAttribute('content', this.colorType === 'dark' ? '#009af2' : '#007ac2');
  }
}
