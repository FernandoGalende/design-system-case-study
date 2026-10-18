import { ChangeDetectionStrategy, Component } from '@angular/core';

/** The alert's single text action. Use it on a native link or button. */
@Component({
  selector: 'a[dsAlertAction], button[dsAlertAction]',
  template: '<ng-content />',
  styleUrl: './alert-action.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertActionComponent {}
