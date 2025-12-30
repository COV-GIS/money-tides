import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Assessor from '@arcgis/core/core/Accessor';

@subclass('Application')
export default class Application extends Assessor {
  @property()
  public scale: 's' | 'm' | 'l' = 's';
}
