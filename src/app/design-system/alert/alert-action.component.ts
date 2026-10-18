import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostAttributeToken,
  inject,
} from '@angular/core';

/** The alert's single text action. Use it on a native link or button. */
@Component({
  selector: 'a[dsAlertAction], button[dsAlertAction]',
  template: '<ng-content />',
  styleUrl: './alert-action.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.type]': 'type' },
})
export class AlertActionComponent {
  private readonly isButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';
  private readonly consumerType = inject(new HostAttributeToken('type'), { optional: true });

  /** Buttons default to type=button so an alert inside a form doesn't submit it. Links get no type. */
  protected readonly type = this.isButton ? (this.consumerType ?? 'button') : null;
}
