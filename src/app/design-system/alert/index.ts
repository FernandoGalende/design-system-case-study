import { AlertActionComponent } from './alert-action.component';
import { AlertIconDirective } from './alert-icon.directive';
import { AlertComponent } from './alert.component';

export { AlertActionComponent } from './alert-action.component';
export { AlertIconDirective } from './alert-icon.directive';
export {
  AlertComponent,
  DS_ALERT_VARIANT_LABELS,
  type AlertLive,
  type AlertVariant,
} from './alert.component';

export const ALERT_IMPORTS = [AlertComponent, AlertActionComponent, AlertIconDirective] as const;
