import { ChangeDetectionStrategy, Component } from '@angular/core';

/** The card's header slot. Use it on the element you want, e.g. <header dsCardHeader>. */
@Component({
  selector: '[dsCardHeader]',
  template: '<ng-content />',
  styleUrl: './card-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardHeaderComponent {}
