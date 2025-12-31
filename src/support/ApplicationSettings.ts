import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Assessor from '@arcgis/core/core/Accessor';

@subclass('ApplicationSettings')
export default class ApplicationSettings extends Assessor {
  @property()
  protected preferedColorMode =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  @property()
  public scale: 's' | 'm' | 'l' = 's';

  public setColorMode(mode?: 'dark' | 'light'): void {
    document.body.classList.remove('calcite-mode-dark');

    document.body.classList.remove('calcite-mode-light');

    if (!mode) {
      document.body.classList.add(`calcite-mode-${this.preferedColorMode}`);
    } else {
      document.body.classList.add(`calcite-mode-${mode}`);
    }
  }
}
