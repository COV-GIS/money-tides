import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Assessor from '@arcgis/core/core/Accessor';
import DateTime, { setNoon } from '../utils/dateAndTimeUtils';

@subclass('ApplicationSettings')
export default class ApplicationSettings extends Assessor {
  @property()
  colorMode: 'dark' | 'light' = 'light';

  @property()
  public date = setNoon(DateTime.now().setZone('America/Los_Angeles'));

  @property()
  position: 'end' | 'start' = 'end';

  @property()
  protected preferredColorMode: 'dark' | 'light' =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  @property()
  public scale: 's' | 'm' = 's';

  public setColorMode(mode?: 'dark' | 'light'): void {
    document.body.classList.remove('calcite-mode-dark');

    document.body.classList.remove('calcite-mode-light');

    if (!mode) {
      this.colorMode = this.preferredColorMode;

      document.body.classList.add(`calcite-mode-${this.preferredColorMode}`);
    } else {
      this.colorMode = mode;

      document.body.classList.add(`calcite-mode-${mode}`);
    }
  }
}
