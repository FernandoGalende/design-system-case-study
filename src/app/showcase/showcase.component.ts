import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { ALERT_IMPORTS } from '../design-system/alert';

@Component({
  selector: 'app-showcase',
  imports: [ALERT_IMPORTS],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss',
})
export class ShowcaseComponent {
  protected readonly dismissibleVisible = signal(true);
  private readonly showAgainButton = viewChild.required<ElementRef<HTMLButtonElement>>('showAgain');

  protected dismissAlert() {
    this.dismissibleVisible.set(false);
    // The dismiss button disappears with the alert, so focus moves to a stable control.
    this.showAgainButton().nativeElement.focus();
  }

  protected readonly snippets = {
    variants: `// component.ts
import { ALERT_IMPORTS } from './design-system/alert';
@Component({ imports: [ALERT_IMPORTS], ... })

<!-- template -->
<ds-alert variant="warning" heading="Payment method expiring" live="off">
  Your card ending in 4242 expires next month.
  <a dsAlertAction href="/billing">Update payment method</a>
</ds-alert>`,
    optional: `<ds-alert variant="success" live="off">Changes saved.</ds-alert>

<ds-alert [showIcon]="false" heading="Scheduled maintenance" live="off">...</ds-alert>

<ds-alert heading="Passkeys are here" live="off">
  <svg dsAlertIcon viewBox="0 0 20 20">...</svg>
  ...
</ds-alert>`,
    dismissible: `// The alert only emits; the parent decides whether it is shown.
visible = signal(true);

@if (visible()) {
  <ds-alert dismissible dismissLabel="Dismiss payment alert"
            variant="warning" heading="Payment method expiring"
            (dismissed)="visible.set(false)">
    Your card ending in 4242 expires next month.
  </ds-alert>
}`,
    compact: `<!-- No extra input: the alert switches to its compact
     layout when its container is narrower than 30rem. -->
<div style="inline-size: 375px">
  <ds-alert variant="warning" heading="Payment method expiring">...</ds-alert>
</div>`,
  };
}
