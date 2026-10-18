import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { ALERT_IMPORTS } from '../design-system/alert';

@Component({
  selector: 'app-showcase',
  imports: [ALERT_IMPORTS],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss',
})
export class ShowcaseComponent {
  private readonly injector = inject(Injector);

  protected readonly dismissLabel = 'Dismiss payment alert';
  protected readonly dismissibleVisible = signal(true);
  private readonly showAgainButton = viewChild<ElementRef<HTMLButtonElement>>('showAgain');
  private readonly dismissibleAlert = viewChild('dismissibleAlert', { read: ElementRef });

  // The focused control disappears in both directions, so focus moves to the control that
  // replaces it once it has rendered.
  protected dismissAlert() {
    this.dismissibleVisible.set(false);
    afterNextRender(() => this.showAgainButton()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  // Variants mirror the spec: info and warning are dismissible. When one is dismissed (or
  // restored), focus moves to the group heading so it is never lost.
  protected readonly dismissedVariants = signal<ReadonlySet<'info' | 'warning'>>(new Set());
  private readonly variantsHeading = viewChild.required<ElementRef<HTMLElement>>('variantsHeading');

  protected dismissVariant(variant: 'info' | 'warning') {
    this.dismissedVariants.update((dismissed) => new Set(dismissed).add(variant));
    this.focusVariantsHeading();
  }

  protected restoreVariants() {
    this.dismissedVariants.set(new Set());
    this.focusVariantsHeading();
  }

  private focusVariantsHeading() {
    afterNextRender(() => this.variantsHeading().nativeElement.focus(), {
      injector: this.injector,
    });
  }

  protected showAlert() {
    this.dismissibleVisible.set(true);
    afterNextRender(
      () => {
        const alert: HTMLElement | undefined = this.dismissibleAlert()?.nativeElement;
        alert?.querySelector<HTMLButtonElement>(`button[aria-label="${this.dismissLabel}"]`)?.focus();
      },
      { injector: this.injector },
    );
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

// When the focused control disappears, move focus to the one that replaces it
// once it has rendered: afterNextRender(() => el.focus(), { injector }).
@if (visible()) {
  <ds-alert dismissible dismissLabel="Dismiss payment alert"
            variant="warning" heading="Payment method expiring"
            (dismissed)="hide()">
    Your card ending in 4242 expires next month.
  </ds-alert>
} @else {
  <button type="button" (click)="show()">Show the alert again</button>
}`,
    compact: `<!-- No extra input: the alert switches to its compact
     layout when its container is narrower than 30rem. -->
<div style="inline-size: 375px">
  <ds-alert variant="warning" heading="Payment method expiring">...</ds-alert>
</div>`,
  };
}
