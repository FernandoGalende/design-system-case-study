import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  InjectionToken,
  input,
  output,
} from '@angular/core';
import { AlertActionComponent } from './alert-action.component';
import { AlertIconDirective } from './alert-icon.directive';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';
export type AlertLive = 'off' | 'polite' | 'assertive';

/** Visually hidden prefix read before the content, so the variant never relies on color alone. */
export const DS_ALERT_VARIANT_LABELS = new InjectionToken<Record<AlertVariant, string>>(
  'DS_ALERT_VARIANT_LABELS',
  {
    providedIn: 'root',
    factory: () => ({
      info: 'Information:',
      success: 'Success:',
      warning: 'Warning:',
      error: 'Error:',
    }),
  },
);

const LIVE_ROLES: Record<AlertLive, string | null> = {
  polite: 'status',
  assertive: 'alert',
  off: null,
};

@Component({
  selector: 'ds-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': 'role()',
    '[attr.data-variant]': 'variant()',
  },
})
export class AlertComponent {
  readonly variant = input<AlertVariant>('info');
  readonly heading = input<string>();
  readonly showIcon = input(true, { transform: booleanAttribute });
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly dismissLabel = input('Dismiss');
  /** Defaults to assertive for errors and polite for the rest. Use 'off' for alerts present on page load. */
  readonly live = input<AlertLive>();
  /** The alert is controlled: it only emits, the parent removes it. */
  readonly dismissed = output<void>();

  protected readonly customIcon = contentChild(AlertIconDirective);
  protected readonly action = contentChild(AlertActionComponent);

  private readonly variantLabels = inject(DS_ALERT_VARIANT_LABELS);
  protected readonly variantLabel = computed(() => this.variantLabels[this.variant()]);
  protected readonly resolvedLive = computed<AlertLive>(
    () => this.live() ?? (this.variant() === 'error' ? 'assertive' : 'polite'),
  );
  protected readonly role = computed(() => LIVE_ROLES[this.resolvedLive()]);
}
