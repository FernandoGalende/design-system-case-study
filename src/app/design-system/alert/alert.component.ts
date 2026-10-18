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

export interface AlertLabels {
  /**
   * Visually hidden prefix read before the content. It conveys the variant to assistive
   * technology; visually, warning and error differ only by color (documented trade-off).
   */
  variants: Record<AlertVariant, string>;
  /** Accessible name of the dismiss button; an alert's dismissLabel input overrides it. */
  dismiss: string;
}

/** Every text the alert renders, so an app translates it in one place. */
export const DS_ALERT_LABELS = new InjectionToken<AlertLabels>('DS_ALERT_LABELS', {
  providedIn: 'root',
  factory: () => ({
    variants: {
      info: 'Information:',
      success: 'Success:',
      warning: 'Warning:',
      error: 'Error:',
    },
    dismiss: 'Dismiss',
  }),
});

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
  /** Overrides the dismiss label from DS_ALERT_LABELS for this alert, e.g. to name what it dismisses. */
  readonly dismissLabel = input<string>();
  /** Defaults to assertive for errors and polite for the rest. Use 'off' for alerts present on page load. */
  readonly live = input<AlertLive>();
  /** The alert is controlled: it only emits, the parent removes it. */
  readonly dismissed = output<void>();

  protected readonly customIcon = contentChild(AlertIconDirective);
  protected readonly action = contentChild(AlertActionComponent);

  private readonly labels = inject(DS_ALERT_LABELS);
  protected readonly variantLabel = computed(() => this.labels.variants[this.variant()]);
  protected readonly resolvedDismissLabel = computed(
    () => this.dismissLabel() ?? this.labels.dismiss,
  );
  protected readonly resolvedLive = computed<AlertLive>(
    () => this.live() ?? (this.variant() === 'error' ? 'assertive' : 'polite'),
  );
  protected readonly role = computed(() => LIVE_ROLES[this.resolvedLive()]);
}
